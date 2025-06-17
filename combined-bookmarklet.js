javascript:(function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/AlphaSierraHotel/Timesheet-Rpt-Bookmarklets/combined-script.js';
    script.onload = function() {
        console.log("Script loaded and executed.");
    };
    script.onerror = function() {
        console.error("Failed to load the script.");
    };
    document.body.appendChild(script);
})();
