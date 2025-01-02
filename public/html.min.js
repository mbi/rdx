export function replaceRedditLinks(htmlContent) {
    var replacedText = htmlContent.replace(/href="\/u\/([^"]+)"/g, 'href="user.html?u=$1"').replace(/href="\/r\/([^"]+)"/g, 'href="subreddit.html?r=$1"')
        .replace(/(href=\"https:\/\/(old.|www.|)reddit\.com\/r\/[^\/]+\/comments\/[^"]+)(\?[^"]+)?/g, function(match, p1, p2) {
            return 'class="comment-icon icon" href="comments.html?url=' + encodeURIComponent(p1).replace(/href%3D%22/g, '');
        }).replace(/(href=\"https:\/\/reddit\.com\/r\/[^\/]+\/comments\/[^"]+)(\?[^"]+)?/g, function(match, p1, p2) {
            return 'class="comment-icon icon" comments.html?url=' + encodeURIComponent(p1 + (p2 || ""));
        });
    return replacedText;
}

export function htmlDecode(input) {
    var parser = new DOMParser();
    var decoded = parser.parseFromString(input, 'text/html');
    return decoded.body.textContent;
}
