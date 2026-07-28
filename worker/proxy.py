"""RDX Reddit proxy (WSGI).

Run with any WSGI server, e.g.:

    pip install gunicorn
    gunicorn -w 4 -b 0.0.0.0:8000 proxy:app

Then point RDX's `base_url` (Settings) at the host:port serving this,
e.g. `rdx-proxy.example.com:8000`.

Strategy: forward the client's real browser User-Agent + Accept headers so
Reddit sees a browser, but STRIP Origin/Referer/sec-fetch-*/cookies — those
are what triggered the cross-origin 403 / "network security" block in the
browser. Add permissive CORS so RDX in a normal tab can read the JSON.

Stdlib only (no `requests` dependency).
"""

import gzip
import io
import json
import zlib
from urllib.request import Request, urlopen
from urllib.error import URLError

UPSTREAM = "https://old.reddit.com"
FALLBACK_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

FORWARD = ("user-agent", "accept", "accept-language")
DROP_PREFIXES = ("sec-fetch-", "sec-ch-")
DROP_EXACT = {
    "origin", "referer", "cookie", "authorization",
    "range", "if-none-match", "if-modified-since",
    "host", "connection", "content-length",
}

CORS_HEADERS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, OPTIONS"),
    ("Access-Control-Allow-Headers", "*"),
    ("Access-Control-Max-Age", "86400"),
]


def _build_upstream_headers(environ):
    out = {}
    for name in FORWARD:
        v = environ.get("HTTP_" + name.upper().replace("-", "_"))
        if v:
            out[name] = v
    if "user-agent" not in out:
        out["user-agent"] = FALLBACK_UA
    out.setdefault("accept", "application/json, text/plain, */*")
    out["sec-fetch-site"] = "same-origin"
    out["sec-fetch-mode"] = "navigate"
    out["sec-fetch-dest"] = "document"
    out["upgrade-insecure-requests"] = "1"
    out["accept-encoding"] = "identity"
    return out


def _client_blocked_response(status, payload):
    body = json.dumps(payload).encode("utf-8")
    headers = [("Content-Type", "application/json")] + CORS_HEADERS
    return body, status, headers


def _decompress(body, encoding):
    if not body:
        return body
    enc = (encoding or "").lower()
    if "gzip" in enc:
        return gzip.decompress(body)
    if "deflate" in enc:
        try:
            return zlib.decompress(body)
        except zlib.error:
            return zlib.decompress(body, -zlib.MAX_WBITS)
    return body


def application(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET")
    path = environ.get("PATH_INFO", "/")
    query = environ.get("QUERY_STRING", "")
    target = UPSTREAM + path + ("?" + query if query else "")

    if method == "OPTIONS":
        start_response("204 No Content", CORS_HEADERS)
        return [b""]

    if method != "GET":
        body, status, headers = _client_blocked_response(
            "405 Method Not Allowed", {"error": "method_not_allowed"}
        )
        start_response(status, headers)
        return [body]

    req_headers = _build_upstream_headers(environ)
    try:
        req = Request(target, headers=req_headers, method="GET")
        with urlopen(req, timeout=15) as resp:
            status = resp.status
            raw = resp.read()
            resp_headers = list(resp.headers.items())
            content_type = resp.headers.get("Content-Type", "")
            content_encoding = resp.headers.get("Content-Encoding", "")
    except URLError as e:
        body, status, headers = _client_blocked_response(
            "502 Bad Gateway",
            {"error": "upstream_fetch_failed", "detail": str(e)},
        )
        start_response(status, headers)
        return [body]
    except Exception as e:
        body, status, headers = _client_blocked_response(
            "502 Bad Gateway",
            {"error": "upstream_fetch_failed", "detail": str(e)},
        )
        start_response(status, headers)
        return [body]

    if status == 403 or "text/html" in content_type.lower():
        body, st, headers = _client_blocked_response(
            "502 Bad Gateway",
            {
                "error": "reddit_blocked",
                "status": status,
                "hint": "Reddit bot-management challenged the proxy. "
                        "Try a different egress IP / datacenter.",
            },
        )
        start_response(st, headers)
        return [body]

    out_body = _decompress(raw, content_encoding)
    out_headers = [(k, v) for k, v in resp_headers
                   if k.lower() not in ("content-encoding", "content-length",
                                        "transfer-encoding", "connection")]
    out_headers += [("Access-Control-Allow-Origin", "*"),
                    ("Access-Control-Expose-Headers", "*")]

    start_response(f"{status} OK", out_headers)
    return [out_body]


app = application
