
import { getget, setTitle, makereq, checklc } from "./functions.min.js?v=CACHEBUSTER";

var links = '<a href="subreddit.html?r='+getget('r')+'&sort=new">New</a><a href="subreddit.html?r='+getget('r')+'&sort=best">Best</a><a href="subreddit.html?r='+getget('r')+'&sort=rising">Rising</a><a href="subreddit.html?r='+getget('r')+'&sort=top">Top</a><a href="subreddit.html?r='+getget('r')+'&sort=top&t=week">Top (week)</a><a href="subreddit.html?r='+getget('r')+'&sort=top&t=month">Top (month)</a><a href="subreddit.html?r='+getget('r')+'&sort=top&t=year">Top (year)</a><a href="subreddit.html?r='+getget('r')+'&sort=top&t=all">Top (all)</a>';
var substoload = getget('r');

if(checklc('subs', substoload)){
    links += '<a href="#" data-target="'+getget('r')+'" id="subbtn">Unsubscribe</a>';
} else {
    links += '<a href="#" data-target="'+getget('r')+'" id="subbtn">Subscribe</a>';
}

var fill = '';




var url='https://www.reddit.com/r/'+substoload+'/';
if(getget('sort') != null){
    url = url+''+getget('sort')+'';
}


var limit = localStorage.getItem('ppg') || 20;
url = url+'.json?limit='+limit;

if(getget('t') != null){
    url = url+'&t='+getget('t');
}

if(getget('after') != null){
    url = url+'&after='+getget('after');
}
if(getget('before') != null){
    url = url+'&before='+getget('before');
}

document.getElementById('pagetitletext').innerHTML = getget('r');
document.getElementById('rightbar').innerHTML = links;
setTitle('r/' + substoload);

makereq(url);
