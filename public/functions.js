var bmr = '';
// Utility functions [UNIVERSAL]

var seenPostIds = [];

var nexturl = '';
var nextseturl = '';
if (JSON.parse(localStorage.getItem("subs")) !== null) {
    subslisted = '';
    subslistedarray = JSON.parse(localStorage.getItem("subs"));
    subslistedarray.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    for (x in subslistedarray) {
        subslisted += '<a href="subreddit.html?r=' + subslistedarray[x] + '" class="homelinks">' + subslistedarray[x] + '</a>';
    }
    document.getElementById('subscribed').innerHTML = subslisted;
}


function toggletheme() {
    const curtheme = localStorage.getItem('tname') || "default";
    if (curtheme != 'default' && curtheme != 'Default') {
        document.documentElement.style.setProperty('--bodyc', localStorage.getItem('bodyc'));
        document.documentElement.style.setProperty('--textc', localStorage.getItem('textc'));
        document.documentElement.style.setProperty('--linkc', localStorage.getItem('linkc'));
        document.documentElement.style.setProperty('--greyc', localStorage.getItem('greyc'));
        document.documentElement.style.setProperty('--lightc', localStorage.getItem('lightc'));
    } else {
        document.documentElement.style.setProperty('--bodyc', 'white');
        document.documentElement.style.setProperty('--textc', 'black');
        document.documentElement.style.setProperty('--linkc', '#27598c');
        document.documentElement.style.setProperty('--greyc', '#eee');
        document.documentElement.style.setProperty('--lightc', '#444');
    }
}

function togglefont() {
    const curfont = localStorage.getItem('fname') || "default";
    if (curfont != 'default') {
        const le = document.createElement('link');
        le.rel = 'stylesheet';
        le.href = 'https://fonts.googleapis.com/css2?family=' + curfont + '&display=swap';
        document.head.appendChild(le);
        document.body.style.fontFamily = curfont + ', sans-serif';
    }
}

var curinfi = localStorage.getItem('curinfi') || true;
if (window.location.href.indexOf("comments.html") == -1) {
    if (curinfi) {
        var style = document.createElement('style');
        style.innerHTML = '.footer, .infotext, .next {display:none !important}';
        document.head.appendChild(style);
    }
}
togglefont();

function toggle(id) {
    var x = document.getElementsByClassName("show");
    for (k = 0; k < x.length; k++) {
        if (x[k].id != id) {
            x[k].classList.toggle("hidden");
            x[k].classList.toggle("show");
        }
    }
    document.getElementById(id).classList.toggle("hidden");
    document.getElementById(id).classList.toggle("show");
    if (id == "subssearch") {
        document.getElementById("subssearchi").focus();
    }
}
//function htmlDecode(input){
// var e = document.createElement('textarea');
// e.innerHTML = input;
// handle case of empty input
// return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
//}



function makereq(url) {
    var fill = '';
    var req = new XMLHttpRequest();
    var post_data;
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = function() {
        var jsonResponse = req.response;
        console.log(url);
        var titlesx = url.replace("https://www.reddit.com/r/", "");
        titlesx = titlesx.replace("/.json", "");
        document.title = 'r/' + titlesx.split('?limit')[0];
        posts = jsonResponse['data']['children'].filter(
            (post) => seenPostIds.indexOf(post.id) === -1
        );
        for (var item in posts) {
            post_data = posts[item]['data'];
            fill += postbuilder(post_data);
            seenPostIds.push(post_data.id);
        }

        fill += '<div class="navigate">';
        var curpage = window.location.href.replace(/\&after.*/, '');
        if (jsonResponse['data']['after'] != null) {
            if (curpage.indexOf("?") === -1) {
                curpage = curpage + '?a=b';
            }
            fill += '<a class="next" href="' + curpage + '&after=' + jsonResponse['data']['after'] + '">Next page</a><div id="sxpy"></div><div id="sentinel"> </div>';
            nextseturl = curpage + '&after=' + jsonResponse['data']['after'];
            nexturl = url.split('&after')[0] + "&after=" + jsonResponse['data']['after'];
        }
        fill += '</div>';
        document.getElementById('body').innerHTML = fill;
        runhsl();
        if (curinfi) {
            observe();
        }
    };
    req.onerror = function() {
        document.getElementById('body').innerHTML = '<center style="padding:15px;">Can\'t load content!<br><small>There can be multiple reasons for this, your browser\'s aggresive privacy settings may be blocking the one call to reddit.com RDX makes. This happens usually when you use a VPM/Proxy and/or a privacy focused browser like Firefox.<br> Play around with privacy/tracking options or change your browser. If it still doesn\'t work click the feedback link and send me some info.</small></center>';
    };
    req.send(null);
}

function scorllmore() {
    var post_data;

    const url = nexturl;
    let fill = '';
    if (nexturl != '') {
        console.log(nexturl);
    } else {
        return false;
    }
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = function() {
        var jsonResponse = req.response;
        posts = jsonResponse['data']['children'].filter(
            (post) => seenPostIds.indexOf(post.id) === -1
        );
        for (var item in posts) {
            post_data = posts[item]['data'];
            fill += postbuilder(post_data);
            seenPostIds.push(post_data.id);
        }
        var curpage = window.location.href.replace(/\&after.*/, '');
        if (jsonResponse['data']['after'] != null) {
            if (curpage.indexOf("?") === -1) {
                curpage = curpage + '?a=b';
            }
            history.pushState("", "newtitle", nextseturl);
            nextseturl = curpage + '&after=' + jsonResponse['data']['after'];
            nexturl = url.split('&after')[0];
            nexturl = nexturl + "&after=" + jsonResponse['data']['after'];
        } else {
            nexturl = '';
        }
        document.getElementById('sxpy').insertAdjacentHTML('beforeend', fill);
        document.getElementById('sentinel').innerHTML = ' ';
        runhsl();
    };
    req.onerror = function() {
        document.getElementById('sxpy').innerHTML += '<center style="padding:15px;">Can\'t load content! Refresh the page or try again later.</center>';
        nexturl = '';
    };
    req.send(null);
}

function observe() {
    const options = {
        root: null,
        threshold: 1.0
    };
    cantload = false;

    function callback(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (cantload == false) {
                    document.getElementById('sentinel').innerHTML = '<center>Loading more posts..</center>';
                    cantload = true;
                    setTimeout(() => {
                        scorllmore();
                        cantload = false;
                    }, 100);
                }
            }
        });
    }
    const observer = new IntersectionObserver(callback, options);
    const sentinel = document.getElementById('sentinel');
    if (sentinel) {
        observer.observe(sentinel);
    }
}


function htmlDecode(input) {
    var parser = new DOMParser();
    var decoded = parser.parseFromString(input, 'text/html');
    return decoded.body.textContent;
}

function timeago(o) {
    var t = Math.floor((new Date - o) / 1e3),
        a = t / 31536e3;
    return a > 1 ? Math.floor(a) + "y" : (a = t / 2592e3) > 1 ? Math.floor(a) + "mo" : (a = t / 86400) > 1 ? Math.floor(a) + "d" : (a = t / 3600) > 1 ? Math.floor(a) + "h" : (a = t / 60) > 1 ? Math.floor(a) + "m" : Math.floor(t) + "s"
}

function addlc(to, data) {
    addarr = JSON.parse(localStorage.getItem(to) || '[]');
    addarr.push(data);
    localStorage.setItem(to, JSON.stringify(addarr));
}

function checklc(to, cfor) {
    chkarr = JSON.parse(localStorage.getItem(to) || '[]');
    return chkarr.includes(cfor);

}

function removelc(to, cfor) {
    addarr = JSON.parse(localStorage.getItem(to) || '[]');
    addarr = addarr.filter(function(item) {
        return item !== cfor
    })

    localStorage.setItem(to, JSON.stringify(addarr));
}

function searchsubs(q, event) {
    if (bmr) {
        bmr.abort();
    }
    var xhr = new XMLHttpRequest();
    bmr = xhr;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status == 200) {
            subslist = xhr.response;
            fillsubs = '';
            for (var singlesub in subslist['subreddits']) {
                //console.log(subslist[singlesub]);
                fillsubs += '<a href="subreddit.html?r=' + subslist['subreddits'][singlesub]['name'] + '">' + subslist['subreddits'][singlesub]['name'] + '</a>';
            }
            document.getElementById('subslist').innerHTML = fillsubs;
        }
    }
    xhr.responseType = 'json';
    xhr.open('GET', 'https://www.reddit.com//api/subreddit_autocomplete/.json?query=' + q + '&include_profiles=false&include_over_18=true', true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
    if (q.length > 1) {
        var key = event.keyCode || event.charCode;
        if (key == 13) {
            if (typeof subslist['subreddits'] !== undefined) {
                window.location = 'subreddit.html?r=' + subslist['subreddits'][0]['name'] + '';
            }
        }
    }
}

function unsubscribe(sub) {
    removelc('subs', sub);
    subbtn = document.getElementById('subbtn');
    subbtn.setAttribute("onclick", 'subscribe(\'' + sub + '\')');
    subbtn.innerHTML = 'Subscribe';
}

function subscribe(sub) {
    addlc('subs', sub);
    subbtn = document.getElementById('subbtn');
    subbtn.setAttribute("onclick", 'unsubscribe(\'' + sub + '\')');
    subbtn.innerHTML = 'Unsubscribe';
}

function replaceRedditLinks(htmlContent) {
    var replacedText = htmlContent.replace(/href="\/u\/([^"]+)"/g, 'href="user.html?u=$1"').replace(/href="\/r\/([^"]+)"/g, 'href="subreddit.html?r=$1"')
        .replace(/(href=\"https:\/\/(old.|www.|)reddit\.com\/r\/[^\/]+\/comments\/[^"]+)(\?[^"]+)?/g, function(match, p1, p2) {
            return 'class="comment-icon icon" href="comments.html?url=' + encodeURIComponent(p1).replace(/href%3D%22/g, '');
        }).replace(/(href=\"https:\/\/reddit\.com\/r\/[^\/]+\/comments\/[^"]+)(\?[^"]+)?/g, function(match, p1, p2) {
            return 'class="comment-icon icon" comments.html?url=' + encodeURIComponent(p1 + (p2 || ""));
        });
    return replacedText;
}


function postbuilder(post) {
    returnfpost = '';
    let mode = localStorage.getItem('curmode') || "original";
    if (window.location.href.indexOf("comments.html") != -1) {
        mode = "original";
    }
    timeagoed = timeago(post['created_utc'] * 1000);
    sticky = post['stickied'] ? " sticky" : " ";
    over18 = '';
    if (checklc('a18', 'yes') != true) {
        over18 = post['over_18'] ? "over18" : " ";
    }
    ismod = (post['distinguished'] == "moderator") ? " moderator" : " ";
    returnfpost += '<div class="post ' + mode + '" id="' + post['id'] + '">';
    if (mode == "comp") {
        thumbnail = post['thumbnail'];
        if (thumbnail != "self" && thumbnail != "spoiler" && thumbnail != "default" && thumbnail != "" && thumbnail != "nsfw") {
            if (thumbnail == "image") {
                thumbnail = post["preview"]['images'][0]['resolutions'][0]['url'];
            }
            returnfpost += '<div class="compthumb"><img src="' + thumbnail + '" alt="thumbnail"/></div><div class="rop">';
        } else {
            thumbnail = thumbnail || "&bull;";
            const mx = post?.preview?.images?.[0]?.resolutions?.[0]?.url || "none";
            if (mx != "none") {
                returnfpost += '<div class="compthumb"><img src="' + mx + '" alt="thumbnail"/></div><div class="rop">';

            } else {
                returnfpost += '<div class="comptext">' + thumbnail + '</div><div class="rop">';
            }
        }
    }
    returnfpost += '<div class="post_link' + sticky + ' ' + ismod + '"><a href="comments.html?url=https://www.reddit.com' + post['permalink'] + '">' + post['title'] + '</a></div>';

    if (mode != "comp") {
        if (post["selftext_html"] != null) {
            var replacedText = replaceRedditLinks(post["selftext_html"]);

            returnfpost += '<div class="postc selftext">' + htmlDecode(replacedText) + '</div>';
        }
        urli = post['url_overridden_by_dest'];


        if ((post['crosspost_parent_list'] != null && post['crosspost_parent_list'].length > 0) || (typeof post['crosspost_parent_list'] !== 'undefined' && post['crosspost_parent_list'].length > 0)) {
            returnfpost += postbuilder(post['crosspost_parent_list'][0]);
        } else {
            // if (over18 === 'over18') {
            //     returnfpost += '<button onclick="allown_sfw()" class="sfwtoggle">Click to Allow this content</button>';
            // }
            if (typeof urli != "undefined" && post['removed_by_category'] == null) {
                returnfpost += '<div class="urlpreview ' + over18 + '">' + urlpreview(urli, post) + '</div><div style="text-align: right;font-size:12px;"><a href="' + post['url'] + '"><small>Open URL</small></a></div>';
            }
            if (post['removed_by_category'] != null) {
                returnfpost += 'Removed by ' + post['removed_by_category'];
            }
            if (post['poll_data'] != null) {
                returnfpost += pollbuilder(post);
            }
        }
    }


    returnfpost =  returnfpost
            + '<div class="post_meta"><div class="flex-left">'
            +'<a class="comments-icon icon" href="comments.html?url=https://www.reddit.com' + post['permalink'] + '">'
            + post['num_comments'] + '</a>'
            + '<span class="upvotes-icon icon">' + post['score'] + '</span>';

    returnfpost += '</div><div class="post_author flex-right"><a href="subreddit.html?r=' + post["subreddit"] + '">' + post["subreddit_name_prefixed"] + '</a> <a class="small-hidden" href="user.html?u=' + post["author"] + '">' + post["author"] + '</a> ' + timeagoed + '</div>';


    if (localStorage.getItem('refreshToken') !== null && window.location.href.includes('comments.html')) {
        returnfpost += ' &bull; <span onclick="replyto(\'t3_' + post['id'] + '\')">Reply</span>';
    }
    returnfpost += '</div>';
    if (mode == "comp") {
        returnfpost += '</div>';
    }

    returnfpost += '</div>';
    return returnfpost;
}

function allown_sfw() {
    addlc('a18', 'yes');
    window.location.reload();
}

function preloadImage(im_url) {
    let container = document.createElement('div');
    container.innerHTML = `<img src="${im_url}" />`;

    document.body.appendChild(container);
    setTimeout(function() {
        document.body.removeChild(container);
    }, 1);
}

function closegal() {
    document.getElementById('newgallery').outerHTML = '';
}

function galleryopen(theid) {
    const jdiv = document.createElement('div');
    jdiv.id = 'newgallery';
    document.getElementsByTagName('body')[0].appendChild(jdiv);
    jdiv.innerHTML = '<span id="closegal" onclick="closegal();">Close</span>';
    document.querySelectorAll('[data-id="' + theid + '"]').forEach(el => {
        jdiv.innerHTML += '<div class="displayimg"><img src="' + el.getAttribute('data-msrc') + '"></div>';
    });
}

function previewImage(postjson) {
    var ret_url;
    try {
        var ret = postjson.preview.images[0].resolutions[0];
        postjson.preview.images[0].resolutions.forEach( (obj) => {
            if (obj.width && obj.width >= ret.width && obj.width <= 640) {
                ret = obj;
            }
        })
        ret_url = ret.url;
    } catch(err) {
        console.log(err);
        ret_url  = postjson["thumbnail"];
    }

    return ret_url;
}

function urlpreview(urli, postjson) {
    returnpost = '';
    if (urli.match(/.(jpg|jpeg|png)$/i)) {
        returnpost += '<div class="postc singleimage"><img src="' + urli + '"/></div>';
    } else if (urli.match(/.(gif)$/i)) {
        const x = postjson?.preview?.images?.[0]?.variants?.mp4?.source?.url || "none";
        if (x == "none") {
            returnpost += '<div class="postc singleimage"><img src="' + urli + '"/></div>';

        } else {
            vidposter = postjson["preview"];
            if (typeof vidposter == "undefined") {
                vidposter = postjson["thumbnail"];
            } else {

                vidposter = postjson["preview"]["images"]["0"]["source"]["url"];
            }

            var posterurl = previewImage(postjson);

            returnpost += '<div class="postc video generic-gif">'

            returnpost += '<a href="#" data-target="' + postjson['id'] + '" class="lazy-video imgur-com">';
            returnpost += '<img  loading="lazy" src="' + posterurl + '#t=0.001"/>';
            returnpost += '</a>';
            returnpost += '<template id="vt-' + postjson['id'] + '">';
            returnpost += '<video id="v' + postjson['id'] + '" src="' + x + '#t=0.001" poster="' + posterurl + '" width="100%" preload="none" loop controls>';
            returnpost += '</video>';
            returnpost += '</template>';
            returnpost += '</div>';

        }
    } else if (urli.match(/www.reddit.com\/gallery/g)) {
        returnpost += '<div class="postc gallery">';
        pjmd = postjson['media_metadata'];
        pjgd = postjson['gallery_data'];
        const pjmdsorted = {};
        if (pjgd) {
            pjgd.items.forEach((item, index) => {
                const mediaId = item.media_id;
                if (pjmd.hasOwnProperty(mediaId)) {
                    pjmdsorted[mediaId] = pjmd[mediaId];
                }
            });
        }
        let g_timgs = '';
        let g_mimg = '';
        let fakect = ' actv';

        returnpost += '<slide-show controls="pagination navigation">';

        for (var singlept in pjmdsorted) {
            if (pjmdsorted[singlept]['status'] != 'failed') {
                singleptlink = pjmdsorted[singlept]['s']['u'];
                if (typeof singleptlink == "undefined") {
                    singleptlink = pjmdsorted[singlept]['s']['gif'];
                } else {
                    singleptlink = singleptlink.replace("preivew.redd", "i.redd");
                }
                singletmlink = pjmdsorted[singlept]['p']['0']['u'];

                /*if (fakect == ' actv') {
                    g_mimg = '<img src="' + singleptlink + '" alt="main image" id="mi_' + postjson['id'] + '" onclick="galleryopen(\'' + postjson['id'] + '\')"/>';
                }
                g_timgs += '<img class="gtumb' + fakect + '" src="' + singletmlink + '" data-msrc="' + singleptlink + '" alt="thumbnail" data-id="' + postjson['id'] + '">';
                preloadImage(singleptlink);
                */
                returnpost += '<img style="object-fit:contain" draggable="false" src="' + singleptlink + '" />';

                //returnpost +='<img src="'+singleptlink+'" />';
            }
            fakect = '';
        }
        returnpost += '</slide-show>';


        /*
        returnpost += '<div class="gallery_main">';
        returnpost += g_mimg;
        returnpost += '</div>';
        returnpost += '<div class="gallery_thumbs">';
        returnpost += g_timgs;
        returnpost += '</div>';
        */

        returnpost += '</div>';
    } else if (urli.match(/v.redd.it/g)) {
        returnpost += '<div class="postc video vreddit">';
        if (postjson['secure_media'] != null) {
            vidurl = postjson['secure_media']['reddit_video']['dash_url'];
            hlsurl = postjson['secure_media']['reddit_video']['hls_url'];
            fallbackurl = postjson['secure_media']['reddit_video']['fallback_url'];
            //returnpost +='<video id="v'+postjson['id']+'" src="'+vidurl+'" poster="'+postjson["thumbnail"]+'" width="100%" height="240" preload="metadata" onplay="playaud(\'a'+postjson['id']+'\')"  onpause="pauseaud(\'a'+postjson['id']+'\')"  onseeking="pauseaud(\'a'+postjson['id']+'\')"  onseeked="seeked(\''+postjson['id']+'\')"   controls> </video><audio src="'+urli+'/DASH_audio.mp4" id="a'+postjson['id']+'" controls></audio> ';
            vidposter = postjson["preview"];
            if (typeof vidposter == "undefined") {
                vidposter = postjson["thumbnail"];
            } else {

                vidposter = postjson["preview"]["images"]["0"]["source"]["url"];
            }

            var posterurl = previewImage(postjson);


            returnpost += '<a href="#" data-target="' + postjson['id'] + '" class="lazy-video">';
            returnpost += '<img loading="lazy" src="' + posterurl + '#t=0.001"/>';
            returnpost += '</a>';

            returnpost += '<template id="vt-' + postjson['id'] + '">';
            returnpost += '<video id="v' + postjson['id'] + '" src="' + fallbackurl + '" data-hls="' + hlsurl + '" poster="' + posterurl + '" width="100%" preload="none"  controls>';
            returnpost += '</video>';
            returnpost += '</template>';

        } else {
            returnpost += 'crosspost';
        }
        returnpost += '</div>';
    } else if (urli.match(/redgifs/g) && postjson.preview) {
        returnpost += '<div class="postc video redgifs">';
        if (postjson['secure_media']) {
            vidurl = postjson['secure_media']['oembed']['thumbnail_url'];
            if (typeof vidurl == "undefined") {
                vidurl = urli.replace("redgifs.com/watch/", "redgifs.com/ifr/");
                vidurl = '<iframe src="' + vidurl + '?autoplay=0" class="gifframe"></iframe>';
                returnpost += vidurl;
            } else {
                if (postjson['preview'] && typeof postjson['preview']['reddit_video_preview'] != "undefined") {
                    vidurl = postjson['preview']['reddit_video_preview']['fallback_url'];
                } else if (postjson['secure_media']['oembed']['thumbnail_url']) {
                    vidurl = postjson['secure_media']['oembed']['thumbnail_url'];
                }
                vidurl = vidurl.replace("size_restricted.gif", "mobile.mp4")
                var posterurl = previewImage(postjson);

                returnpost += '<a href="#" data-target="' + postjson['id'] + '" class="lazy-video">';
                returnpost += '<img  loading="lazy" src="' + posterurl + '#t=0.001"/>';
                returnpost += '</a>';

                returnpost += '<template id="vt-' + postjson['id'] + '">';
                returnpost += '<video id="v' + postjson['id'] + '" src="' + vidurl + '" poster="' + posterurl + '" width="100%" preload="none"  controls>';
                returnpost += '</video>';
                returnpost += '</template>';

            }
        }
        returnpost += '</div>';
    } else if (urli.match(/gfycat.com/g)) {
        returnpost += '<div class="postc video gyfcat">';
        if (postjson['secure_media'] == null || typeof postjson['secure_media']['oembed']['thumbnail_url'] == "undefined") {


            vidurl = urli.replace("gfycat.com/", "gfycat.com/ifr/");
            vidurl = '<iframe src="' + vidurl + '?autoplay=0" class="gifframe"></iframe>';
            returnpost += vidurl;
        } else {
            if (typeof postjson['preview']['reddit_video_preview'] != "undefined") {
                vidurl = postjson['preview']['reddit_video_preview']['fallback_url'];
            } else if (postjson['secure_media']['oembed']['thumbnail_url']) {
                vidurl = postjson['secure_media']['oembed']['thumbnail_url'];
            }
            vidurl = vidurl.replace("size_restricted.gif", "mobile.mp4")
            returnpost += '<video src="' + vidurl + '" poster="' + postjson["thumbnail"] + '" width="100%" height="240" preload="metadata" controls> </video>';
        }
        returnpost += '</div>';
    } else if (urli.match(/i.imgur.com(.*?)gifv/g)) {
        returnpost += '<div class="postc video imgur">';
        let vidurl = urli.replace(".gifv", ".mp4");
        var posterurl = previewImage(postjson);
        returnpost += '<a href="#" data-target="' + postjson['id'] + '" class="lazy-video">';
        returnpost += '<img  loading="lazy" src="' + posterurl + '#t=0.001"/>';
        returnpost += '</a>';
        returnpost += '<template id="vt-' + postjson['id'] + '">';
        returnpost += '<video  id="v' + postjson['id'] + '" src="' + vidurl + '" poster="' + posterurl + '#t=0.001" width="100%" preload="none" controls class="lazy">';
        returnpost += '</video>';
        returnpost += '</template>';
        returnpost += '</div>';
    } else {
        thumbnailforit = '';
        if (postjson["thumbnail"].length > 9) {
            returnpost += '<a href="' + urli + '"  class="wholethumb"><div class="postc thumblink"><div class="thumb"><img src="' + postjson["thumbnail"] + '"/></div><div class="thumblinklink">' + urli + '</div></div></a>';
        } else {
            returnpost += '<div class="postc link"><a href="' + urli + '" >' + thumbnailforit + '' + urli + '</a></div>';
        }
        returnpost = replaceRedditLinks(returnpost);
    }
    return returnpost;
}




function pollbuilder(postjson) {
    returnpoll = '<div class="poll">';
    for (popt in postjson['poll_data']['options']) {
        vote_count = postjson['poll_data']['options'][popt]['vote_count'];
        "undefined" == typeof vote_count && (vote_count = " ");
        returnpoll += '<div class="polloption"><span class="polloptiontext">' + postjson['poll_data']['options'][popt]['text'] + '</span> <span  class="votecount">' + vote_count + '</span>';
        if (vote_count != ' ') {
            returnpoll += '<div class="optionmeter" style="width:' + postjson['poll_data']['options'][popt]['vote_count'] / postjson['poll_data']['total_vote_count'] * 100 + '%;"></div>';
        }
        returnpoll += '</div>';
    }
    returnpoll += '<div class="totalvotes">Total votes: ' + postjson['poll_data']['total_vote_count'] + '</div>';
    returnpoll += '</div>';
    return returnpoll;
}

function playaud(id) {
    document.getElementById(id).play();
}

function pauseaud(id) {
    document.getElementById(id).pause();
}

function seeked(id) {
    //document.getElementById(id).pause();
    document.getElementById('a' + id).currentTime = document.getElementById('v' + id).currentTime;
}

function getget(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function cbuilder(comment) {
    timeagoed = timeago(comment['created_utc'] * 1000);
    isop = comment['is_submitter'] == true ? "isop" : "";
    ismod = comment['distinguished'] == " moderator" ? "ismod" : "";



    cret = '<div class="comment ccp' + comment['depth'] + (comment['author'] === 'AutoModerator' ? ' collapsed' : '') + '" id="' + comment['id'] + '"><div class="comment_author"><span class="authorttext ' + isop + '' + ismod + '"><a class="authorlink" href="user.html?u=' + comment['author'] + '">' + comment['author'] + '</a></span>  <span class="comment_meta comments-icon icon">' + comment['score'] + ' &bull; ' + timeagoed + ' </span></div><div class="comment_text">' + replaceRedditLinks(htmlDecode(comment['body_html'])) + '</div>';
    if (localStorage.getItem('refreshToken') != null) {
        cret += '<div class="comment-reply"><span onclick="replyto(\'t1_' + comment['id'] + '\')">Reply</span>';
        if (localStorage.getItem('userName') == comment['author']) {
            cret += '<span onclick="editto(\'t1_' + comment['id'] + '\')">Edit</span><span onclick="deleteto(\'t1_' + comment['id'] + '\')">Delete</span>';
        }
        cret += '</div>';
    }
    cret += '</div>';
    return cret;
}

function runhsl() {
    const videos = document.querySelectorAll('.reddit_hls:not(.goner)');


    videos.forEach(video => {
        const videoContainer = video.parentElement;
        video.classList.add('goner');
        //  if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Browser natively supports HLS
        //     video.src = video.src;
        //     } else if (Hls.isSupported()) {
        // Use hls.js for HLS playback
        //         const hls = new Hls();
        //        hls.loadSource(video.src);
        //       hls.attachMedia(video);

        //  } else {
        // Provide a fallback for unsupported browsers
        //    video.src = video.getAttribute('data-fallback');

        // }
        const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
        if (isIOS) {
            video.src = video.getAttribute('data-hls');
        } else {
            const hls = dashjs.MediaPlayer().create();
            hls.initialize(video, video.src, false);
        }
    });

    const gtumbs = document.querySelectorAll('.gtumb');
    gtumbs.forEach(gtum => {
        gtum.addEventListener("click", function() {
            const curod = this.getAttribute('data-id');
            document.getElementById("mi_" + curod).src = this.getAttribute('data-msrc');

            document.querySelectorAll('[data-id="' + curod + '"]').forEach(el => el.classList.remove('actv'));

            this.classList.add('actv');
            document.getElementById("mi_" + curod).scrollIntoView();
        });
    });


}


function shareit() {
    if (navigator.share) {
        const t = window.location.href;
        const n = document.title;
        const e = {
            title: n,
            url: t
        };
        navigator.share(e).then(() => {
            console.log("Shared successfully")
        }).catch(e => {
            console.error("Error sharing:", e)
        })
    } else {
        const t = window.location.href,
            n = document.createElement("textarea");
        n.value = t, document.body.appendChild(n), n.select(), document.execCommand("copy"), document.body.removeChild(n), alert("Link copied to clipboard: " + t)
    }
}

function saveit(e) {

    if (e.innerHTML == 'Saved') {
        window.location.href = 'saved.html';
        return false;
    }
    const u = window.location.href;
    const t = document.title;
    const s = document.querySelector('.post_author a').innerText;
    const savedLinks = JSON.parse(localStorage.getItem('savedlinks')) || [];
    savedLinks.push({
        u,
        t,
        s
    });
    localStorage.setItem('savedlinks', JSON.stringify(savedLinks));
    e.innerHTML = 'Saved';
}

function displayit() {
    const savedLinks = JSON.parse(localStorage.getItem('savedlinks')) || [];
    const linksContainer = document.getElementById('links-container');
    linksContainer.innerHTML = '';

    for (let i = savedLinks.length - 1; i >= 0; i--) {
        const link = savedLinks[i];

        const linkElement = document.createElement('div');
        linkElement.className = 'post';
        linkElement.innerHTML = '<div class="post_author"><a href="subreddit.html?r=' + link.s.replace('r/', '') + '">' + link.s + '</a> <span onclick="removeit(' + i + ');" style="float:right;color: var(--lightc);">X</span> </div><div class="post_link"><a href="' + link.u + '">' + link.t + '</a></div>';
        linksContainer.appendChild(linkElement);
    }
}

function removeit(index) {
    const savedLinks = JSON.parse(localStorage.getItem('savedlinks')) || [];

    // Ensure index is within bounds
    if (index >= 0 && index < savedLinks.length) {
        savedLinks.splice(index, 1); // Remove the element at the specified index
        localStorage.setItem('savedlinks', JSON.stringify(savedLinks));
        displayit(); // Update the display after removing the link
    }
}


function replyto(cmtid) {
    document.getElementById('popitup').style.display = 'block';
    document.getElementById('cmtid').value = cmtid;
    document.getElementById('actype').value = "c";
    let ebId = cmtid.replace(/^(t1_|t3_)/, '');
    if (document.getElementById(ebId).className != "post") {
        document.getElementById('helptext').textContent = 'Reply to: ' + document.getElementById(ebId).querySelector('.comment_text').textContent;

    } else {
        document.getElementById('helptext').textContent = 'Reply to:' + document.getElementById(ebId).querySelector('.post_link a').textContent;

    }
    document.getElementById('commentText').focus();
}

function editto(cmtid) {
    document.getElementById('popitup').style.display = 'block';
    document.getElementById('cmtid').value = cmtid;
    let ebId = cmtid.replace(/^(t1_|t3_)/, '');
    document.getElementById('commentText').value = document.getElementById(ebId).querySelector('.comment_text').textContent;
    document.getElementById('actype').value = "e";
    document.getElementById('helptext').textContent = 'Editing: ' + document.getElementById(ebId).querySelector('.comment_text').textContent;
    document.getElementById('commentText').focus();
}

function deleteto(cmtid) {
    const confirmation = confirm("Are you sure you want to delete this?");
    if (confirmation) {
        document.getElementById('cmtid').value = cmtid;
        document.getElementById('actype').value = "d";
        apiAction();
    }
}

function inboxto() {
    document.getElementById('actype').value = "i";
    apiAction();
}

function apiAction() {
    const accessToken = localStorage.getItem('accessToken');
    const expiresIn = localStorage.getItem('expiresIn');
    const refreshToken = localStorage.getItem('refreshToken');
    const clientId = localStorage.getItem('clientId');
    const clientSecret = localStorage.getItem('clientSecret');
    const redirectUri = 'https://rdx.overdevs.com/login.html';
    const actionType = document.getElementById('actype').value;


    if (accessToken && expiresIn) {
        const currentTimestamp = Date.now();
        const expiresAt = parseInt(expiresIn);
        if (currentTimestamp < expiresAt) {
            if (actionType == "c") {
                submitComment(accessToken);
            } else if (actionType == "e") {
                editComment(accessToken);
            } else if (actionType == "d") {
                delComment(accessToken);
            } else if (actionType == "i") {
                getInbox(accessToken);
            } else {}
        } else {
            // Access token has expired, renew it using refreshToken
            const tokenUrl = 'https://www.reddit.com/api/v1/access_token';
            fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                    },
                    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
                })
                .then(response => response.json())
                .then(tokenData => {
                    const newAccessToken = tokenData.access_token;
                    const newRefreshToken = tokenData.refresh_token;
                    const expiresIn = tokenData.expires_in; // Expires in seconds
                    const expirationTimestamp = currentTimestamp + (expiresIn * 1000);
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    localStorage.setItem('expiresIn', expirationTimestamp.toString());
                    if (actionType == "c") {
                        submitComment(accessToken);
                    } else if (actionType == "e") {
                        editComment(accessToken);
                    } else if (actionType == "d") {
                        delComment(accessToken);
                    } else if (actionType == "i") {
                        getInbox(accessToken);
                    } else {}
                })
                .catch(error => {
                    document.getElementById('cmntbtn').disabled = false;
                    document.getElementById('cmntbtn').innerHTML = 'Submit';
                    alert('Error refreshing token:', error);
                });
        }
    } else {
        window.location.href = 'login.html';
    }
}

function submitComment(accessToken) {
    document.getElementById('cmntbtn').disabled = true;
    document.getElementById('cmntbtn').innerHTML = 'Submitting...';
    const thingId = document.getElementById('cmtid').value;
    const commentText = document.getElementById('commentText').value;
    const commentUrl = 'https://oauth.reddit.com/api/comment';
    fetch(commentUrl, {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `api_type=json&text=${encodeURIComponent(commentText)}&thing_id=${thingId}`,
        })
        .then(response => response.json())
        .then(commentData => {
            if (commentData.errors && commentData.errors.length > 0) {
                document.getElementById('cmntbtn').disabled = false;
                document.getElementById('cmntbtn').innerHTML = 'Submit';
                alert('Error submitting comment:' + commentData.errors);
            } else {
                document.getElementById('cmntbtn').disabled = false;
                document.getElementById('cmntbtn').innerHTML = 'Submit';
                document.getElementById('popitup').style.display = 'none';
                document.getElementById('commentText').value = '';
                let ebId = thingId.replace(/^(t1_|t3_)/, '');
                let ccclass = "ccp0";
                if (document.getElementById(ebId).className != "post") {
                    let ccNumber = document.getElementById(ebId).className.match(/ccp\d+/)[0].replace("ccp", "");
                    ccNumber = Math.floor(ccNumber) + 1;
                    ccclass = "ccp" + ccNumber;
                }
                document.getElementById(ebId).insertAdjacentHTML('afterEnd', '<div class="comment ' + ccclass + '"><div class="comment_author"><span class="authorttext ">You</span>  <span class="comment_meta">1 votes • Just now </span></div><div class="comment_text">' + commentText + '</div></div>');
            }
        })
        .catch(error => {
            document.getElementById('cmntbtn').disabled = false;
            document.getElementById('cmntbtn').value = 'Submit';
            alert('Error submitting comment:' + error);
        });
}

function editComment(accessToken) {
    document.getElementById('cmntbtn').disabled = true;
    document.getElementById('cmntbtn').innerHTML = 'Submitting...';
    const thingId = document.getElementById('cmtid').value;
    const commentText = document.getElementById('commentText').value;
    const commentUrl = 'https://oauth.reddit.com/api/editusertext';
    fetch(commentUrl, {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `api_type=json&text=${encodeURIComponent(commentText)}&thing_id=${thingId}`,
        })
        .then(response => response.json())
        .then(commentData => {
            if (commentData.errors && commentData.errors.length > 0) {
                document.getElementById('cmntbtn').disabled = false;
                document.getElementById('cmntbtn').innerHTML = 'Submit';
                alert('Error editing comment:' + commentData.errors);
            } else {
                document.getElementById('cmntbtn').disabled = false;
                document.getElementById('cmntbtn').value = 'Submit';
                document.getElementById('popitup').style.display = 'none';
                document.getElementById('commentText').value = '';
                let ebId = thingId.replace(/^(t1_|t3_)/, '');
                document.getElementById(ebId).querySelector('.comment_text').textContent = commentText;
            }
        })
        .catch(error => {
            document.getElementById('cmntbtn').disabled = false;
            document.getElementById('cmntbtn').innerHTML = 'Submit';
            alert('Error editing comment:' + error);
        });
}

function delComment(accessToken) {
    const thingId = document.getElementById('cmtid').value;
    const commentUrl = 'https://oauth.reddit.com/api/del';
    fetch(commentUrl, {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${thingId}`,
        })
        .then(response => response.json())
        .then(commentData => {
            if (commentData.errors && commentData.errors.length > 0) {

                alert('Error deleting comment:' + commentData.errors);
            } else {

                let ebId = thingId.replace(/^(t1_|t3_)/, '');
                document.getElementById(ebId).style.display = 'none';
            }
        })
        .catch(error => {
            alert('Error deleting comment:' + error);
        });
}

function getInbox(accessToken) {
    const inboxUrl = 'https://oauth.reddit.com/message/inbox';

    fetch(inboxUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })
        .then(response => response.json())
        .then(inboxData => {
            if (inboxData.error) {
                console.error('Error fetching inbox messages:', inboxData.error);
            } else {
                const inboxMessages = inboxData.data.children;
                console.log(inboxMessages);

                let html = '';

                inboxMessages.forEach((item) => {
                    const {
                        kind,
                        inboxMessages: {
                            author,
                            created_utc,
                            subject,
                            link_title,
                            body_html,
                            tname,
                            context
                        }
                    } = item;
                    const date = new Date(created_utc * 1000);
                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;

                    if (kind === 't1') {
                        html += `<div class="inboxmsgwrap"><div class="ibxmeta"><span class="ibxauthor"><a href="user.html?u=${author}">u/${author}</a> &bull;  <span class="ibxtime">${formattedDate}</span></span></div>`;
                        html += `<div class="ibxsub">${subject}</div>`;
                        html += `<div class="ibxlink"><a href="comments.html?url=https://www.reddit.com${context}">${link_title}</a></div>`;
                        html += `<div class="ibxmsg">${body_html}</div>`;
                        html += `<div class="ibxactions"><button onclick="replyto('${tname}')">Reply</button></div></div>`;
                    } else if (kind === 't4') {
                        html += `<div class="inboxmsgwrap"><div class="ibxmeta"><span class="ibxauthor"><a href="user.html?u=${author}">u/${author}</a> &bull;  <span class="ibxtime">${formattedDate}</span></span></div>`;
                        html += `<div class="ibxsub">${subject}</div>`;
                        html += `<div class="ibxmsg">${body_html}</div></div>`;
                        html += `<div class="ibxactions"><button onclick="replyto('${tname}')">Reply</button></div></div>`;

                    }
                });
                document.getElementById('inboxbody').innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error fetching inbox messages:', error);
        });
}

function setupUnloadVideo(vid) {
    const intersectionObserver = new IntersectionObserver((entries) => {
      // If intersectionRatio is 0, the target is out of view
      // and we do not need to do anything.
      if (entries[0].intersectionRatio <= 0) {
            let a = vid.parentNode.querySelector('.lazy-video.hidden');
            if(a) {
                a.classList.remove('hidden');
                vid.remove();
            };
      };
    });
    intersectionObserver.observe(document.querySelector("#" + vid.id));
}

window.onload = function() {
    curq = getget('q') ? getget('q') : '';
    html1 = '<form class="search" action="search.html"><input type="search" name="q" value="' + curq + '"/>';
    html1 += '<input type="submit" value="Search"/><br style="clear:both;">';
    if (window.location.href.indexOf("?r=") > -1 || window.location.href.indexOf("&r=") > -1) {
        html1 += '<input type="checkbox" id="chk1" name="r" value="' + getget('r') + '" checked><label for="chk1"> Only search r/' + getget('r') + '</label>';
    }
    if (window.location.href.indexOf("?u=") > -1 || window.location.href.indexOf("&u=") > -1) {
        html1 += '<input type="checkbox" id="chk1" name="u" value="' + getget('u') + '" checked><label for="chk1"> Only search u/' + getget('u') + '</label>';
    }

    if (window.location.href.indexOf("/r/") > -1) {
        ther = window.location.href.match(/r\/(.*?)\//s)[1];
        html1 += '<input type="checkbox" id="chk1" name="r" value="' + ther + '" checked><label for="chk1"> Only search r/' + ther + '</label>';
    }
    html1 += '</form>';
    if (localStorage.getItem('refreshToken') !== null) {
        const uu = localStorage.getItem('userName');
        html1 += '<a href="user.html?u=+' + uu + '" class="homelinks">' + uu + '</a>';
        html1 += '<a href="inbox.html" class="homelinks half">Inbox</a>';
        html1 += '<a href="login.html" class="homelinks half">Logout</a>';
    }

    document.getElementById("leftbar").insertAdjacentHTML("afterBegin", html1);

    /* lazy video */
    document.addEventListener('click', (e) => {
        if(e.target.closest('a.lazy-video') && e.target.closest('a').dataset.target) {
            let a = e.target.closest('a');
            let id = a.dataset.target;
            let vid_frag = document.getElementById('vt-' + id).content.cloneNode(true);;
            a.parentNode.insertBefore(vid_frag, a);
            a.classList.add('hidden');
            setTimeout(() => {
                let vid = document.getElementById('v' + id);
                vid.play();

                setupUnloadVideo(vid);
            }, 100);

            e.preventDefault();
            return false;
        }
    })


}