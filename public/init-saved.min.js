import "./functions.min.js?v=CACHEBUSTER";

function displaySavedItem() {
    const savedLinks = JSON.parse(localStorage.getItem('savedlinks')) || [];
    const linksContainer = document.getElementById('body');
    linksContainer.innerHTML = '';

    for (let i = savedLinks.length - 1; i >= 0; i--) {
        const link = savedLinks[i];

        const linkElement = document.createElement('div');
        linkElement.className = 'post';
        linkElement.innerHTML = '<div class="post_author"><a href="subreddit.html?r=' + link.s.replace('r/', '') + '">' + link.s + '</a>'
        +'<a href="#" class="remove-button" data-idx="' + i + '" style="float:right;color: var(--lightc);">X</span>'
        +'</div><div class="post_link"><a href="' + link.u + '">' + link.t + '</a>'
        +'</div>';
        linksContainer.appendChild(linkElement);
    }
}

function removeSavedItemByIndex(index) {
    const savedLinks = JSON.parse(localStorage.getItem('savedlinks')) || [];

    // Ensure index is within bounds
    if (index >= 0 && index < savedLinks.length) {
        savedLinks.splice(index, 1); // Remove the element at the specified index
        localStorage.setItem('savedlinks', JSON.stringify(savedLinks));
        displaySavedItem(); // Update the display after removing the link
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-button') && e.target.dataset.idx) {
        e.preventDefault();
        removeSavedItemByIndex(e.target.dataset.idx);
    }
});

displaySavedItem();
