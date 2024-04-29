import { getget, setTitle, makereq, postbuilder, postsLoadedCallback, collapseComment, cbuilder } from "./functions.min.js";
import { loadcomments } from './comments.min.js';

var thisthread;
var pagenum = 0;


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('load-more-comments')) {
        e.preventDefault();
        loadmore(document.getElementById('paginate').dataset.cids.split(' '));
    }
})


function loadmore(cids){
    if (!cids) {
        return
    }
    var urljson = '';

    for (var i = pagenum*60; i < cids.length; i++){
        urljson += cids[i]+',';

        if(i > 60*(pagenum+1)) {
            pagenum = pagenum + 1;
            break;
        }
    }

    var req = new XMLHttpRequest();
    req.responseType = 'json';
    urljson = urljson.replace(/,\s*$/, "");

    req.open('GET','https://www.reddit.com/r/'+thisthread['subreddit']+'/api/morechildren.json?api_type=json&&link_id='+thisthread['name']+'&limit=500&r=AskReddit&children='+urljson, true);
    req.onload  = function() {
        var jsonResponse = req.response;
        //thisthread = jsonResponse[0]['data']['children'][0]['data'];
        //document.getElementById('pagetitletext').innerHTML = thisthread['subreddit']
        var comments = jsonResponse['json']['data']['things'];
        document.getElementById('body').innerHTML += loadcomments(comments);

    };
    req.send(null);
}

function opencmenu(cid){
    cidi = document.getElementById(cid).getAttribute('menushown');

    if(cidi == 'yes'){
       document.getElementById(cid+'cc').remove();
       document.getElementById(cid).setAttribute('menushown','no');
       console.log('yy');
    } else {
        htmltoc = '<div class="cmenu" id="'+cid+'cc"><a onclick="">Save</a></div>';
        document.getElementById(cid).insertAdjacentHTML("afterBegin", htmltoc);
        document.getElementById(cid).setAttribute('menushown','yes');
    }
}

document.body.classList.add('comments')



var url = getget('url'), roqs = url.split('?');
url = roqs[0];
roqs = roqs[1];
url = url.replace(/https:\/\/reddit.com/g, 'https://www.reddit.com');
url = url.replace(/amp.reddit.com/g, 'www.reddit.com');
url = url.replace(/m.reddit.com/g, 'www.reddit.com');
url = url.replace(/i.reddit.com/g, 'www.reddit.com');
var links = '<a href="comments.html?url='+url+'&sort=new">New</a><a href="comments.html?url='+url+'&sort=best">Best</a><a href="comments.html?url='+url+'&sort=top">Top</a><a href="comments.html?url='+url+'&sort=controversial">Controversial</a><a href="comments.html?url='+url+'&sort=old">Old</a><a href="comments.html?url='+url+'&sort=qa">QnA</a><a onclick="saveit(this)" id="sharebutton" style="border-top: 5px solid var(--greyc);">Save</a><a onclick="shareit();" id="sharebutton">Share</a>';
document.getElementById('rightbar').innerHTML = links;
url = url+'.json?limit=500';

if(getget('sort') != null){
    url = url+'&sort='+getget('sort');

}
url = url+'&'+roqs;

var req = new XMLHttpRequest();
req.responseType = 'json';
req.open('GET', url, true);
req.onload  = function() {
    var jsonResponse = req.response;
    thisthread = jsonResponse[0]['data']['children'][0]['data'];
    document.getElementById('body').innerHTML += postbuilder(thisthread);
    document.getElementById('pagetitletext').innerHTML = thisthread['subreddit'];
    setTitle(thisthread['title']);
    var comments = jsonResponse[1]['data']['children'];
    document.getElementById('body').innerHTML += loadcomments(comments);

    let commentsdivs =   document.getElementById('body').getElementsByClassName('comment');
    for (let i=0; i < commentsdivs.length; i++) {
        commentsdivs[i].addEventListener('dblclick', (e) => { collapseComment(e.target.closest('.comment')) }  );
    }
    //runhsl();
    postsLoadedCallback(true);
};
req.send(null);