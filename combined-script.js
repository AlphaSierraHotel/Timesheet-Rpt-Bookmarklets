(async function() {
    console.log("Script started.");

    // 01-Add-100-Selection.js
    async function add100Selection() {
        console.log("add100Selection function called.");
        var selectElement = document.querySelector('#DataTables_Table_0_length select');
        if (selectElement) {
            console.log("Select element found.");
            var newOption = document.createElement('option');
            newOption.value = '100';
            newOption.text = '100';
            selectElement.appendChild(newOption);
            selectElement.value = '100';
            var event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);
            console.log("Option added and change event dispatched.");

            // Wait for the data to load
            await new Promise(resolve => {
                var observer = new MutationObserver((mutations, observerInstance) => {
                    if (document.querySelector('#DataTables_Table_0 tbody tr')) {
                        observerInstance.disconnect();
                        resolve();
                    }
                });
                observer.observe(document.querySelector('#DataTables_Table_0 tbody'), { childList: true });
            });
            console.log("Data loaded.");
        } else {
            console.log("Select element not found.");
        }
    }

    // 02-Remove-Non-Hourly-Summary.js and 04-Remove-Non-Hourly-Details.js combined
    function removeNonHourlyEntries() {
        console.log("removeNonHourlyEntries function called.");
        var namesToRemove = [
            'Anthony Dos Santos', 'Sub Trade', 'Allen Hubble', 'Carefree Plumbing Inc',
            'City Centre Contractors', 'Frank Facchini', 'Sera Weatherall', 'Shawna Brooker', 'Sherry Facchini'
        ];

        // Remove non-hourly summary items
        var summaryItems = document.querySelectorAll('#summary .list-item');
        summaryItems.forEach(function(item) {
            var text = item.textContent || item.innerText;
            if (namesToRemove.some(function(name) { return text.includes(name); })) {
                item.remove();
                console.log("Removed summary item:", text);
            }
        });

        // Remove non-hourly details and update totals
        const rows = document.querySelectorAll("#DataTables_Table_0 tbody tr:is(.odd, .even)");
        let total = 0, count = 0;

        rows.forEach((row) => {
            const name = row.querySelector("td:nth-child(1)")?.textContent.trim();
            const hoursCell = row.querySelector("td:nth-child(3)");
            const hours = parseFloat(hoursCell?.textContent.trim()) || 0;

            if (namesToRemove.includes(name)) {
                row.remove();
                console.log("Removed detail row for:", name);
            } else {
                total += hours;
                count++;
            }
        });

        const totalCell = document.querySelector("#DataTables_Table_0 .totals td.u-textRight");
        if (totalCell) {
            totalCell.textContent = total.toFixed(2);
            console.log("Updated total cell:", total.toFixed(2));
        }

        const info = document.querySelector("#DataTables_Table_0_info");
        if (info) {
            info.textContent = `Showing 1 to ${count} of ${count} entries`;
            console.log("Updated info text:", info.textContent);
        }
    }

    // 03-Update-Summary-Total.js
    function updateSummaryTotal() {
        console.log("updateSummaryTotal function called.");
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
    }

    // 05-Adjust Columns.js
    function adjustColumns() {
        console.log("adjustColumns function called.");
        const headers = document.querySelectorAll("#DataTables_Table_0 thead td");
        if (headers.length >= 4) {
            headers[0].style.width = "20%";
            headers[1].style.width = "15%";
            headers[2].style.width = "10%";
            headers[3].style.width = "55%";
            console.log("Adjusted column widths.");
        } else {
            console.log("Not enough headers found to adjust columns.");
        }
    }

    // Attach functions to the window object
    window.add100Selection = add100Selection;
    window.removeNonHourlyEntries = removeNonHourlyEntries;
    window.updateSummaryTotal = updateSummaryTotal;
    window.adjustColumns = adjustColumns;

    // Execute functions in the required order
    console.log("Executing functions in order.");
    await add100Selection();
    removeNonHourlyEntries();
    updateSummaryTotal();
    adjustColumns();
    console.log("Script execution completed.");
})();
