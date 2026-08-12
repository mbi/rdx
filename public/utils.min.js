
export function timeago(o) {
    var t = Math.floor((new Date - o) / 1e3),
        a = t / 31536e3;
    return a > 1 ? Math.floor(a) + "y" : (a = t / 2592e3) > 1 ? Math.floor(a) + "mo" : (a = t / 86400) > 1 ? Math.floor(a) + "d" : (a = t / 3600) > 1 ? Math.floor(a) + "h" : (a = t / 60) > 1 ? Math.floor(a) + "m" : Math.floor(t) + "s"
}