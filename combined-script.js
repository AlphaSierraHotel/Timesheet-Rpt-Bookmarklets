(async function() {
    const RELEASE_VERSION = "v0.3.0";
    console.log(`Timesheet report cleanup ${RELEASE_VERSION} started.`);

    // Collect the pay period and week selection.
    function collectPayrollInfo() {
        return new Promise(resolve => {
            const style = document.createElement('style');
            style.textContent = `
                #payrollInfoOverlay {
                    position: fixed;
                    inset: 0;
                    z-index: 2147483647;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.45);
                }
                #payrollInfoDialog {
                    box-sizing: border-box;
                    width: min(432px, calc(100vw - 32px));
                }
            `;

            const overlay = document.createElement('div');
            overlay.id = 'payrollInfoOverlay';
            overlay.innerHTML = `
                <form id="payrollInfoDialog" class="card card--paddingNone" role="dialog"
                    aria-modal="true" aria-labelledby="payrollInfoTitle">
                    <div class="card-header card-header--bgFill">
                        <span class="card-headerTitle" id="payrollInfoTitle">Report payroll period</span>
                    </div>
                    <div style="padding: var(--space-slim) var(--space-base)">
                        <label class="fieldLabel u-textBold" for="payrollPeriodRemainder">Pay period</label>
                        <input id="payrollPeriodRemainder" class="input u-marginBottomSmaller"
                            type="text" required pattern="[0-9]{2}-[0-9]{2}" maxlength="5"
                            placeholder="YY-##" aria-describedby="payrollPeriodFormat"
                            style="display: block; width: 100%; box-sizing: border-box">
                        <small id="payrollPeriodFormat">Enter the two-digit year and pay period number, e.g. 26-22.</small>
                        <fieldset class="u-marginTopSmall" style="border-radius: var(--radius-base) var(--radius-base) !important">
                            <legend class="fieldLabel u-textBold">Pay period week</legend>
                            <div class="flexBlock flexBlock--noGrow">
                                <div class="radio radio--button">
                                    <input id="payrollWeekOne" type="radio" name="payrollWeek"
                                        value="Week One" required>
                                    <label class="radio-label" for="payrollWeekOne">Week One</label>
                                </div>
                                <div class="radio radio--button">
                                    <input id="payrollWeekTwo" type="radio" name="payrollWeek"
                                        value="Week Two">
                                    <label class="radio-label" for="payrollWeekTwo">Week Two</label>
                                </div>
                            </div>
                        </fieldset>
                        <div class="dialog-actions">
                            <div class="flexBlock flexBlock--noGrow">
                                <button type="submit" class="button button--green">Continue</button>
                                <button type="button" id="payrollInfoCancel" class="button button--ghost">Cancel</button>
                            </div>
                        </div>
                    </div>
                </form>
            `;

            let settled = false;
            const finish = value => {
                if (settled) return;
                settled = true;
                document.removeEventListener('keydown', handleKeydown);
                overlay.remove();
                style.remove();
                resolve(value);
            };
            const handleKeydown = event => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    finish(null);
                }
            };

            document.head.appendChild(style);
            document.body.appendChild(overlay);
            const form = overlay.querySelector('#payrollInfoDialog');
            const periodInput = overlay.querySelector('#payrollPeriodRemainder');
            form.addEventListener('submit', event => {
                event.preventDefault();
                if (!form.reportValidity()) return;

                const week = form.querySelector('input[name="payrollWeek"]:checked').value;
                finish({ payPeriod: 'PP' + periodInput.value.trim(), week: week });
            });
            overlay.querySelector('#payrollInfoCancel').addEventListener('click', () => finish(null));
            document.addEventListener('keydown', handleKeydown);
            periodInput.focus();
        });
    }

    // Insert or update the payroll subtitle.
    function updateReportSubtitle(payrollInfo) {
        const summary = document.querySelector('#summary');
        if (!summary || !summary.parentNode) {
            console.error('Cannot add report subtitle: summary element not found.');
            return false;
        }

        let subtitle = document.querySelector('#reportSubTitle');
        if (!subtitle) {
            subtitle = document.createElement('h2');
            subtitle.id = 'reportSubTitle';
        }
        subtitle.classList.add('headingTwo');
        subtitle.textContent = 'Pay Period ' + payrollInfo.payPeriod + ' -- ' + payrollInfo.week;
        summary.parentNode.insertBefore(subtitle, summary);
        console.log('Report subtitle set to "' + subtitle.textContent + '".');
        return true;
    }

    // Display all entries reported by DataTables.
    async function ensureAllRowsDisplayed(rowCount) {
        if (!Number.isSafeInteger(rowCount) || rowCount < 0) {
            console.error('Cannot set page size: invalid row count.', rowCount);
            return false;
        }
        if (rowCount === 0) {
            console.log('The report contains no entries; skipping page-size change.');
            return true;
        }

        var selectElement = document.querySelector('#DataTables_Table_0_length select');
        const tbody = document.querySelector('#DataTables_Table_0 tbody');
        const info = document.querySelector('#DataTables_Table_0_info');
        if (!tbody || !info) {
            console.error('Cannot verify rendered rows: table body or info element is missing.');
            return false;
        }

        const getRenderedDataRowCount = () => Array.from(tbody.querySelectorAll('tr')).filter(row => {
            const name = row.querySelector('td')?.textContent.trim() || '';
            return !row.classList.contains('totals') && !/^report\s+totals?:?$/i.test(name);
        }).length;
        const isFullPageDisplayed = () => {
            const infoMatch = info.textContent.match(
                /Showing\s+([\d,]+)\s+to\s+([\d,]+)\s+of\s+([\d,]+)\s+entries/i
            );
            if (!infoMatch) return false;

            const start = Number(infoMatch[1].replace(/,/g, ''));
            const end = Number(infoMatch[2].replace(/,/g, ''));
            const total = Number(infoMatch[3].replace(/,/g, ''));
            return start === 1 && end === rowCount && total === rowCount &&
                getRenderedDataRowCount() >= rowCount;
        };

        if (isFullPageDisplayed()) {
            console.log('All ' + getRenderedDataRowCount() +
                ' entries are already displayed; page-size change not needed.');
            return true;
        }
        if (!selectElement) {
            console.error('Cannot set page size: rows-per-page selector is missing.');
            return false;
        }

        const optionValue = String(rowCount);
        if (!Array.from(selectElement.options).some(option => option.value === optionValue)) {
            var newOption = document.createElement('option');
            newOption.value = optionValue;
            newOption.text = optionValue;
            selectElement.appendChild(newOption);
        }

        console.log('Setting rows per page to ' + rowCount + ' entries.');
        const loadedAllRows = await new Promise(resolve => {
            let settled = false;
            let observer;
            let timeoutId;
            const finish = loaded => {
                if (settled) return;
                settled = true;
                if (observer) observer.disconnect();
                clearTimeout(timeoutId);
                resolve(loaded);
            };
            const checkForFullPage = () => {
                if (isFullPageDisplayed()) {
                    const renderedDataRows = getRenderedDataRowCount();
                    console.log('Confirmed all ' + renderedDataRows + ' detail rows are rendered.');
                    finish(true);
                }
            };

            observer = new MutationObserver(checkForFullPage);
            observer.observe(tbody, { childList: true, subtree: true });
            observer.observe(info, { childList: true, subtree: true, characterData: true });
            timeoutId = setTimeout(() => {
                const renderedDataRows = getRenderedDataRowCount();
                console.error('Timed out waiting for all entries. DataTables info: "' +
                    info.textContent.trim() + '"; rendered detail rows: ' + renderedDataRows + '.');
                finish(false);
            }, 5000);

            selectElement.value = optionValue;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            checkForFullPage();
        });
        return loadedAllRows;
    }

    // Remove non-hourly entries from the summary and detail table.
    function removeNonHourlyEntries() {
        var namesToRemove = [
            'Frank Facchini',
            'Sherry Facchini',
            'Allen Hubble',
            'Scott Hubble',
            'Carefree Plumbing Inc',
            'City Centre Contractors',
            'JJ Downs',
            'Sub Trade'
        ];

        var summaryItems = document.querySelectorAll('#summary .list-item');
        var removedSummaryItems = [];
        summaryItems.forEach(function(item) {
            var name = namesToRemove.find(function(candidate) {
                return (item.textContent || item.innerText || '').includes(candidate);
            });
            if (name) {
                var hoursElement = item.querySelector('.shrink.columns');
                var hours = hoursElement ? hoursElement.textContent.trim() : 'hours unavailable';
                item.remove();
                removedSummaryItems.push(name + ' (' + hours + ')');
            }
        });

        var rows = document.querySelectorAll('#DataTables_Table_0 tbody tr');
        var detailHeaders = Array.from(
            document.querySelectorAll('#DataTables_Table_0 thead tr td, #DataTables_Table_0 thead tr th')
        ).map(function(header) {
            return header.textContent.trim();
        });
        var total = 0;
        var count = 0;
        var removedDetailRows = [];
        var includedDetailRows = [];

        rows.forEach(function(row) {
            var cells = Array.from(row.querySelectorAll('td')).map(function(cell) {
                return cell.textContent.trim();
            });
            var name = cells[0] || '';
            var hoursText = cells[2] || '0';
            var hours = parseFloat(hoursText) || 0;

            if (row.classList.contains('totals') || /^report\s+totals?:?$/i.test(name)) {
                return;
            } else if (namesToRemove.includes(name)) {
                row.remove();
                removedDetailRows.push(cells);
            } else {
                total += hours;
                count++;
                includedDetailRows.push(
                    '+ ' + (name || '(unnamed)') +
                    (cells[1] ? ' | ' + cells[1] : '') +
                    ' | ' + hours.toFixed(2) +
                    ' = ' + total.toFixed(2)
                );
            }
        });

        if (removedSummaryItems.length) {
            console.log('Removed summary entries:\n- ' + removedSummaryItems.join('\n- '));
        } else {
            console.log('Removed summary entries: none.');
        }
        if (removedDetailRows.length) {
            var markdownHeader = '| ' + detailHeaders.join(' | ') + ' |';
            var markdownDivider = '| ' + detailHeaders.map(function() { return '---'; }).join(' | ') + ' |';
            var markdownRows = removedDetailRows.map(function(cells) {
                var escapedCells = cells.map(function(value) {
                    return value.replace(/\s+/g, ' ').replace(/\|/g, '\\|');
                });
                return '| ' + escapedCells.join(' | ') + ' |';
            });
            console.log('Removed detail rows (' + removedDetailRows.length + '):\n' +
                [markdownHeader, markdownDivider].concat(markdownRows).join('\n'));
        } else {
            console.log('Removed detail rows: none.');
        }
        console.log('Details rows included in total (' + count + '):\n' +
            (includedDetailRows.length ? includedDetailRows.join('\n') : '(none)') +
            '\nDetails total = ' + total.toFixed(2) + ' hours.');

        var totalCell = document.querySelector('#DataTables_Table_0 .totals td.u-textRight');
        if (totalCell) {
            totalCell.textContent = total.toFixed(2);
            console.log('Updated details total cell to ' + total.toFixed(2) + '.');
        }

        var info = document.querySelector('#DataTables_Table_0_info');
        if (info) {
            info.textContent = 'Showing 1 to ' + count + ' of ' + count + ' entries';
            console.log('Updated table info to "' + info.textContent + '".');
        }
        return total;
    }

    // Recalculate the summary total.
    function updateSummaryTotal() {
        var total = 0;
        var items = document.querySelectorAll("#summary .list-item");
        var skippedItems = 0;
        var includedSummaryItems = [];

        items.forEach(function(item) {
            var nameElement = item.querySelector(".columns");
            var hoursElement = item.querySelector(".shrink.columns");

            if (!nameElement || !hoursElement) {
                skippedItems++;
                return;
            }

            var name = nameElement.textContent.trim();
            if (name.includes("Total hours")) {
                return;
            }

            var hoursText = hoursElement.textContent || hoursElement.innerText || "";
            var hours = parseFloat((hoursText || "").replace(/[^0-9.-]+/g, ""));

            if (!isNaN(hours)) {
                total += hours;
                includedSummaryItems.push(
                    '+ ' + name + ' | ' + hours.toFixed(2) +
                    ' = ' + total.toFixed(2)
                );
            } else {
                skippedItems++;
            }
        });

        var totalItem = document.querySelector("#summary .list-item.u-borderTopThicker .shrink.columns, #summary .u-borderTopThicker .shrink.columns");
        if (totalItem) {
            totalItem.textContent = total.toFixed(2) + " hours";
            console.log('Updated summary total element to ' + total.toFixed(2) + ' hours.');
        } else {
            console.warn("Summary total element not found.");
        }
        console.log('Summary rows included in total (' + includedSummaryItems.length + '):\n' +
            (includedSummaryItems.length ? includedSummaryItems.join('\n') : '(none)') +
            '\nSummary total = ' + total.toFixed(2) + ' hours.' +
            (skippedItems ? ' Skipped ' + skippedItems + ' malformed item(s).' : ''));
        return total;
    }

    // Compare the recalculated detail and summary totals.
    function compareReportTotals(detailsTotal, summaryTotal) {
        const detailsCents = Math.round(detailsTotal * 100);
        const summaryCents = Math.round(summaryTotal * 100);
        const differenceCents = summaryCents - detailsCents;

        if (differenceCents === 0) {
            console.log('Report totals match: details ' + detailsTotal.toFixed(2) +
                ' hours; summary ' + summaryTotal.toFixed(2) + ' hours.');
            return;
        }

        const direction = differenceCents > 0 ? 'higher' : 'lower';
        console.warn('Report totals differ: details ' + detailsTotal.toFixed(2) +
            ' hours; summary ' + summaryTotal.toFixed(2) +
            ' hours. Summary is ' + (Math.abs(differenceCents) / 100).toFixed(2) +
            ' hours ' + direction + ' than details.');
    }

    // Define the desired table columns.
    const desiredColumns = ["Name", "Date", "Hours", "Working on"];
    
    // Read the currently displayed table headers.
    function getDisplayedTableHeaders() {
        const tableHeaders = Array.from(document.querySelectorAll('#DataTables_Table_0 thead tr td'));
        return tableHeaders.map(header => header.innerText.trim());
    }

    // Set column visibility to match the desired columns.
    function adjustColumnVisibility() {
        const displayedHeaders = getDisplayedTableHeaders();
        const labels = document.querySelectorAll('#column_selector_menu label');
    
        labels.forEach(label => {
            const input = label.querySelector('input');
            if (!input) {
                return;
            }

            const columnName = label.textContent.trim();
            if (!columnName) {
                return;
            }
    
            const shouldDisplay = desiredColumns.includes(columnName);
    
            const isDisplayed = displayedHeaders.includes(columnName);
    
            if (shouldDisplay && !isDisplayed) {
                input.click();
                console.log('Enabled column: ' + columnName + '.');
            } else if (!shouldDisplay && isDisplayed) {
                input.click();
                console.log('Disabled column: ' + columnName + '.');
            }
        });
    }

    // Set column visibility and widths.
    function adjustColumns() {
        adjustColumnVisibility();
        
        const headers = document.querySelectorAll("#DataTables_Table_0 thead td");
        if (headers.length == 4) {
            const widths = ["20%", "15%", "10%", "55%"];
            headers[0].style.width = "20%";
            headers[1].style.width = "15%";
            headers[2].style.width = "10%";
            headers[3].style.width = "55%";
            console.log('Set table column widths: ' +
                Array.from(headers).map((header, index) =>
                    header.innerText.trim() + ' ' + widths[index]
                ).join(', ') + '.');
        } else {
            console.warn("Expected 4 table headers; found " + headers.length + ".");
        }
    }

    // Run the report-processing steps in sequence.
    console.log('Step 1/5: collect payroll period information.');
    const payrollInfo = await collectPayrollInfo();
    if (!payrollInfo) {
        console.log('Cleanup cancelled; no report changes were made.');
        return;
    }
    // Expose helper functions on the window object.
    window.ensureAllRowsDisplayed = ensureAllRowsDisplayed;
    window.collectPayrollInfo = collectPayrollInfo;
    window.updateReportSubtitle = updateReportSubtitle;
    window.removeNonHourlyEntries = removeNonHourlyEntries;
    window.updateSummaryTotal = updateSummaryTotal;
    window.adjustColumns = adjustColumns;

    console.log('Step 2/5: ensure all detail rows are displayed.');
    const initialInfo = document.querySelector('#DataTables_Table_0_info')?.textContent || '';
    const initialInfoMatch = initialInfo.match(
        /Showing\s+[\d,]+\s+to\s+[\d,]+\s+of\s+([\d,]+)\s+entries/i
    );
    const availableRowCount = initialInfoMatch
        ? Number(initialInfoMatch[1].replace(/,/g, ''))
        : NaN;
    if (!Number.isSafeInteger(availableRowCount) || availableRowCount < 0) {
        console.error('Cannot determine the available row count from the DataTables info text:', initialInfo);
        return;
    }
    console.log('DataTables reports ' + availableRowCount + ' total entries.');
    if (!await ensureAllRowsDisplayed(availableRowCount)) {
        console.error('Stopping cleanup because the full detail data could not be confirmed as rendered.');
        return;
    }
    if (!updateReportSubtitle(payrollInfo)) return;
    console.log('Step 3/5: remove non-hourly entries and total details.');
    const detailsTotal = removeNonHourlyEntries();
    console.log('Step 4/5: recalculate summary total.');
    const summaryTotal = updateSummaryTotal();
    compareReportTotals(detailsTotal, summaryTotal);
    console.log('Step 5/5: adjust displayed columns.');
    adjustColumns();
    console.log("Timesheet report cleanup complete.");
})();
