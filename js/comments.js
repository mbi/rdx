import { timeago } from './utils.min.js?v=CACHEBUSTER';
import { replaceRedditLinks, htmlDecode } from './html.min.js?v=CACHEBUSTER';
import { getget } from "./functions.min.js?v=CACHEBUSTER";

export function cbuilder(comment) {
    let timeagoed = timeago(comment['created_utc'] * 1000);
    let isop = comment['is_submitter'] == true ? "isop" : "";
    let ismod = comment['distinguished'] == " moderator" ? "ismod" : "";

    let body_html = htmlDecode(comment['body_html']);

    /* Replace image posts */
    let media_html = null;
    if(comment.media_metadata) {
        media_html = '';
        Object.keys(comment.media_metadata).forEach((k) => {
            let v = comment.media_metadata[k];

            if(v && v.m && v.m.indexOf('image') === 0 && v.s.u) {
                body_html += '<img style="max-width:'+ v.s.x +'px" class="comment-image" src="' + v.s.u + '" />';
            }
        });


    } else if (comment.body.indexOf('https://youtu.be') === 0) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;  
        var match = comment.body.match(regExp);  
        if (match && match[7].length == 11) {    
            media_html = '<div class="video-frame-wrapper">'
            +'<iframe class="comment-video" frameborder="0" '
            +'src="https://www.youtube.com/embed/'+ match[7] +'">'
            +'</iframe></div>';
        }
    }

    if(media_html) {
        body_html = media_html;
    }

    let cret = '<div class="comment ccp'
        + comment['depth'] + (comment['author'] === 'AutoModerator' ? ' collapsed' : '')
        + '" id="' + comment['id']
        + '"><div class="comment_author"><span class="authorttext '
        + isop + '' + ismod
        + '"><a class="authorlink" href="user.html?u=' + comment['author']
        + '">'
        + comment['author']
        + '</a></span>  <span class="comment_meta upvotes-icon icon">'
        + comment['score']
        + ' &bull; '
        + timeagoed
        + ' </span></div><div class="comment_text">'
        + replaceRedditLinks(body_html)
        + '</div>';

    cret += '</div>';
    return cret;
}

export function loadcomments(comments){
    var ret = '<div class="comments-block">';

    const paginate = document.getElementById('paginate');

    paginate.childNodes.forEach((n) => n.remove());
    paginate.dataset.cids = '';

    for(let item in comments) {
        if(comments[item].kind == 'more' && comments[item].data.children.length){
            let morejson = comments[item].data.children;

            paginate.innerHTML =  '<button class="load-more-comments">Load More</button>';
            paginate.dataset.cids = morejson;
        } else {

            ret += cbuilder(comments[item]['data']);
            let replies  = comments[item]['data']['replies'];
            if(typeof replies === 'object' && replies !== null){
                ret += handlereplies(replies);
            }
        }
    }

    ret += '</div>';

    return ret;
}


function handlerepliesmn(repliesca){
    var ret = '';
    let replieslsa = repliesca['data']['children'];
    for(let replyxy in replieslsa) {
        if(replieslsa[replyxy]['kind'] == "more"){
            ret += '<div class="comment ccp'+ replieslsa[replyxy]['data']['depth'] +'"><div class="comment_author"><a href="?url=https://www.reddit.com'+ replieslsa[replyxy]['data']['permalink'] +' " >View other replies</a></div></div>';
        } else {
            ret += cbuilder(replieslsa[replyxy]['data']);
            var replieshha  = replieslsa[replyxy]['data']['replies'];
            if(typeof replieshha === 'object' && replieshha !== null){
                ret+= '<a class="viewmore" href="?url=https://www.reddit.com'+replieslsa[replyxy]['data']['permalink']+'" >view more replies</a>';
            }
        }
    }

    return ret;

}


function handlerepliesm(repliesc){
    let  repliesls = repliesc['data']['children'];

    var ret = '';

    for(let replyx in repliesls) {
        if(repliesls[replyx]['kind'] == "more"){
            ret += '<div class="comment ccp'
                + repliesls[replyx]['data']['depth']
                +'"><div class="comment_author"><a href="?url=https://www.reddit.com'
                + repliesls[replyx]['data']['permalink']
                +' " >View other replies</a></div></div>';
        }
        else {
            ret += cbuilder(repliesls[replyx]['data']);
            var replieshh  = repliesls[replyx]['data']['replies'];
            if(typeof replieshh === 'object' && replieshh !== null){
                ret += handlerepliesmn(replieshh);
            }
        }
    }

    return ret;

}

function handlereplies(replies){
    let repliesl = replies['data']['children'];
    var ret = '';
    for(let reply in repliesl) {
        //console.log("yy" + reply);
        if(repliesl[reply]['kind'] == "more"){
            let url = getget('url');
            ret += '<a class="viewmore" href="?url='
                + url + repliesl[reply]['data']['id']
                +'/">View more replies</a>';
        } else {
            ret += cbuilder(repliesl[reply]['data']);
            var repliesz  = repliesl[reply]['data']['replies'];

            if(typeof repliesz === 'object' && repliesz !== null){
                ret += handlerepliesm(repliesz);
            }
        }
    }

    return  ret;
}
