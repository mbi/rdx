import { getget, setTitle, makereq } from "./functions.min.js?v=CACHEBUSTER";

let query = getget('q')

if(getget('r') != null){
    console.log(getget('r'));
    query = query+'&r='+getget('r');
}

if(getget('u') != null){
    console.log(getget('r'));
    query = query+'&u='+getget('u');
}


document.getElementById('rightbar').innerHTML = '<a href="search.html?q='+query+'&sort=new">New</a><a href="search.html?q='+query+'&sort=hot">Hot</a><a href="search.html?q='+query+'&sort=top">Top</a><a href="search.html?q='+query+'&sort=top&t=month">Top (month)</a><a href="search.html?q='+query+'&sort=top&t=year">Top (year)</a><a href="search.html?q='+query+'&sort=top&t=all">Top (all)</a>';

var fill = '';


let substoload = getget('q');
document.getElementById('pagetitletext').innerHTML = getget('q');


let url = 'https://www.reddit.com/';


if(getget('r') != null){
    url = url+'r/'+getget('r')+'/search.json?q='+substoload+'&restrict_sr=on';
} else if(getget('u') != null){
    url = url+'search.json?q=author:'+getget('u')+' '+substoload+'&restrict_sr=on';
} else {
    url = url+'search.json?q='+substoload+'';
}

let limit = localStorage.getItem('ppg') || 20;
url = url+'&limit='+limit;

if(getget('sort') != null){
    console.log(getget('sort'));
    url = url+'&sort='+getget('sort');
}

if(getget('t') != null){
    console.log(getget('t'));
    url = url+'&t='+getget('t');
}
url = url+'&include_over_18=on';

if(getget('after') != null){
    url = url+'&after='+getget('after');
}

if(getget('before') != null){
    url = url+'&before='+getget('before');
}

makereq(url);
setTitle(query);
