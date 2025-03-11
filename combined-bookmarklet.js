javascript:(function() {
    if (!document.getElementById('combined-script')) {
        var script = document.createElement('script');
        script.id = 'combined-script';
        script.src = 'https://github.com/yourusername/yourrepository/combined-script.js';
        document.body.appendChild(script);
    } else {
        console.log('Script already loaded.');
        // Execute functions in the required order
        add100Selection();
        removeNonHourlyEntries();
        updateSummaryTotal();
        adjustColumns();
    }
})();
