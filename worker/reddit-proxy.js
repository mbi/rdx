// RDX Reddit proxy worker.
// Deploy as a Cloudflare Worker, then point RDX's `base_url` (Settings) at it.
// e.g. set base_url = `rdx-proxy.your-subdomain.workers.dev`
//
// Strategy: forward the client's real browser User-Agent + Accept headers so
// Reddit sees a browser-like request, but STRIP Origin/Referer/sec-fetch-*/
// cookies — those are exactly what triggers Reddit's 403/"network security"
// block on cross-origin browser calls. Then add permissive CORS headers so
// RDX in a normal browser tab can read the JSON.

const UPSTREAM = 'https://old.reddit.com';

// Fallback UA if the client didn't send one (rare); looks like desktop Chrome.
const FALLBACK_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Headers we DO forward from the browser (these make the request look legit).
const FORWARD = [
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding',
];

// Headers we must NEVER forward — they're what Reddit uses to detect/403
// cross-origin browser calls. (Cookies excluded on purpose: RDX is read-only
// and anonymous; forwarding them would also leak the user's Reddit session.)
const DROP_PREFIXES = ['sec-fetch-', 'sec-ch-'];
const DROP_EXACT = new Set([
    'origin', 'referer', 'cookie', 'authorization',
    'range', 'if-none-match', 'if-modified-since',
]);

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
};

function buildUpstreamHeaders(reqHeaders) {
    const out = new Headers();
    for (const name of FORWARD) {
        const v = reqHeaders.get(name);
        if (v) out.set(name, v);
    }
    if (!out.has('user-agent')) out.set('user-agent', FALLBACK_UA);
    if (!out.has('accept')) out.set('accept', 'application/json, text/plain, */*');
    // Tell Reddit this is a same-origin-ish navigation, not a cross-origin fetch.
    out.set('sec-fetch-site', 'same-origin');
    out.set('sec-fetch-mode', 'navigate');
    out.set('sec-fetch-dest', 'document');
    out.set('upgrade-insecure-requests', '1');
    return out;
}

export default {
    async fetch(request) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS });
        }
        if (request.method !== 'GET') {
            return new Response('Method not allowed', { status: 405, headers: CORS });
        }

        const url = new URL(request.url);
        const target = UPSTREAM + url.pathname + url.search;

        const upstreamHeaders = buildUpstreamHeaders(request.headers);

        let upstream;
        try {
            upstream = await fetch(target, {
                method: 'GET',
                headers: upstreamHeaders,
                redirect: 'follow',
                cf: { cacheEverything: true, cacheTtl: 60 },
            });
        } catch (err) {
            return new Response(
                JSON.stringify({ error: 'upstream_fetch_failed', detail: String(err) }),
                { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
            );
        }

        // Reddit served us a bot-challenge/HTML page instead of JSON.
        if (upstream.status === 403 || (upstream.headers.get('content-type') || '').includes('text/html')) {
            const challenge = await upstream.text();
            return new Response(
                JSON.stringify({
                    error: 'reddit_blocked',
                    status: upstream.status,
                    hint: 'Reddit bot-management challenged the Worker egress. ' +
                          'If this persists, move the proxy off Cloudflare (e.g. a small VPS / ' +
                          'Deno Deploy / Fly.io) — CF egress IPs to reddit.com are frequently flagged.',
                }),
                { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
            );
        }

        const body = await upstream.arrayBuffer();
        const respHeaders = new Headers(upstream.headers);
        respHeaders.set('Access-Control-Allow-Origin', '*');
        respHeaders.set('Access-Control-Expose-Headers', '*');
        // Reddit may have gzipped; decode raw bytes and drop the encoding header
        // so the browser reassembles correctly.
        respHeaders.delete('Content-Encoding');
        respHeaders.delete('Content-Length');

        return new Response(body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: respHeaders,
        });
    },
};
