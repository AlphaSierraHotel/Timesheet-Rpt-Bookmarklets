javascript:(function() {
    var items = document.querySelectorAll('#summary .list-item');
    var namesToRemove = [
        'Anthony Dos Santos', 'Sub Trade', 'Allen Hubble', 'Carefree Plumbing Inc',
        'City Centre Contractors', 'Frank Facchini', 'Sera Weatherall', 'Shawna Brooker', 'Sherry Facchini'
    ];

    items.forEach(function(item) {
        var text = item.textContent || item.innerText;
        if (namesToRemove.some(function(name) { return text.includes(name); })) {
            item.remove();
        }
    });
})();