javascript:(function() {
    const namesToRemove = ["Allen Hubble", "Frank Facchini", "Sherry Facchini", "Sub Trade"];
    const rows = document.querySelectorAll("#DataTables_Table_0 tbody tr:is(.odd, .even)");
    let total = 0, count = 0;

    rows.forEach((row) => {
        const name = row.querySelector("td:nth-child(1)")?.textContent.trim();
        const hoursCell = row.querySelector("td:nth-child(3)");
        const hours = parseFloat(hoursCell?.textContent.trim()) || 0;

        if (namesToRemove.includes(name)) {
            row.remove();
        } else {
            total += hours;
            count++;
        }
    });

    const totalCell = document.querySelector("#DataTables_Table_0 .totals td.u-textRight");
    if (totalCell) {
        totalCell.textContent = total.toFixed(2);
    }

    const info = document.querySelector("#DataTables_Table_0_info");
    if (info) {
        info.textContent = `Showing 1 to ${count} of ${count} entries`;
    }
})();