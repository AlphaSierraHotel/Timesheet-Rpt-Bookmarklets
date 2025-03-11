javascript:(function() {
    var total = 0;
    var items = document.querySelectorAll("#summary .list-item");

    items.forEach(function(item) {
        var name = item.querySelector(".columns").textContent.trim();
        if (name.includes("Total hours")) {
            console.log('Skipping "Total hours" entry:', name);
            return;
        }

        var hoursText = item.querySelector(".shrink.columns").textContent || item.querySelector(".shrink.columns").innerText;
        var hours = parseFloat(hoursText.replace(" hours", ""));

        if (!isNaN(hours)) {
            console.log("Including in total:", name, hours);
            total += hours;
        } else {
            console.log("Excluding from total (NaN):", name);
        }
    });

    console.log("Calculated total hours:", total.toFixed(2));

    var totalItem = document.querySelector("#summary .list-item.u-borderTopThicker .shrink.columns, #summary .u-borderTopThicker .shrink.columns");
    if (totalItem) {
        console.log("Updating total hours in the DOM.");
        totalItem.textContent = total.toFixed(2) + " hours";
    } else {
        console.log("Total hours item not found. Verifying selectors and structure...");
    }
})();