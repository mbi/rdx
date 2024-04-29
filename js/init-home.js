import { getget, setTitle, makereq } from "./functions.min.js";

var fill = '';

var substoload;

if(JSON.parse(localStorage.getItem("subs")) == null || JSON.parse(localStorage.getItem("subs")).length == 0){
    substoload = "all";
} else {
    var subsarray= JSON.parse(localStorage.getItem("subs"));
    substoload = subsarray.join("+");
}

document.getElementById('pagetitletext').innerHTML = 'rdx';


var url='https://www.reddit.com/r/'+substoload+'/';
if(getget('sort') != null){
    url = url+''+getget('sort')+'';
}



var limit = localStorage.getItem('ppg') || 20;
url = url+'.json?limit='+limit;
if(getget('t') != null){
    console.log(getget('t'));
    url = url+'&t='+getget('t');
}

if(getget('after') != null){
    url = url+'&after='+getget('after');
}
if(getget('before') != null){
    url = url+'&before='+getget('before');
}

document.getElementById('pagetitletext').innerHTML = 'Home';
document.getElementById('rightbar').innerHTML = '<a href="/?x=y&sort=new">New</a><a href="/?x=y&sort=best">Best</a><a href="/?x=y&sort=rising">Rising</a><a href="/?x=y&sort=top">Top</a><a onclick="shareit();" id="sharebutton">Share</a>';

setTitle('Home');
makereq(url);
