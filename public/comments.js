import { cbuilder } from "./functions.js";


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
            ret += '<div class="comment ccp'+ repliesls[replyx]['data']['depth'] +'"><div class="comment_author"><a href="?url=https://www.reddit.com'+ repliesls[replyx]['data']['permalink'] +' " >View other replies</a></div></div>';
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
            ret += '<div class="comment ccp'+ repliesl[reply]['data']['depth'] +'"><div class="comment_author"><a href="?url=https://www.reddit.com'+ repliesl[reply]['data']['permalink'] +' " >View other replies</a></div></div>';
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
