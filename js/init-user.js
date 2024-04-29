import { getget, setTitle, makereq, checklc } from "./functions.min.js";


let username = getget('u')
let links = '<a href="user.html?u='+username+'&sort=new">New</a><a href="user.html?u='+username+'&sort=hot">Hot</a><a href="user.html?u='+username+'&sort=top">Top</a><a href="user.html?u='+username+'&sort=top&t=month">Top (month)</a><a href="user.html?u='+username+'&sort=top&t=all">Top (all)</a>';

if(checklc('subs','u_'+username)){
    links += '<a href="#" data-target="u_'+username+'" id="subbtn">Unfollow</a>';
}
else {
    links += '<a href="#" data-target="u_'+username+'" id="subbtn">Follow</a>';
}

document.getElementById('rightbar').innerHTML = links;
var fill = '';


let substoload = getget('u');
document.getElementById('pagetitletext').innerHTML = getget('u');


let url='https://www.reddit.com/user/'+substoload+'/submitted';
let limit = localStorage.getItem('ppg') || 20;
url = url+'.json?limit='+limit;

if(getget('sort') != null){
    console.log(getget('sort'));
    url = url+'&sort='+getget('sort');
}

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
setTitle('u/'+username);
makereq(url);