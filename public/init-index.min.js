import { getget, setTitle, makereq } from "./functions.min.js";

document.getElementById('rightbar').innerHTML = '<a href="/?x=y&sort=new">New</a><a href="/?x=y&sort=best">Best</a><a href="/?x=y&sort=rising">Rising</a><a href="/?x=y&sort=top">Top</a><a onclick="shareit();" id="sharebutton">Share</a>';

var substoload = "all";
document.getElementById('pagetitletext').innerHTML = 'rdx';

var url='https://www.reddit.com/r/'+substoload+'/';
if(getget('sort') != null){
    url = url+''+getget('sort')+'';
}


var limit = localStorage.getItem('ppg') || 20;
url = url+'.json?limit='+limit;
if (getget('t') != null){
    url = url+'&t='+getget('t');
}

if (getget('after') != null){
    url = url+'&after='+getget('after');
}

if (getget('before') != null){
    url = url+'&before='+getget('before');
}

document.getElementById('pagetitletext').innerHTML = '/r/all';
setTitle('/r/all');

makereq(url);