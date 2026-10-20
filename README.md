# Timesheet Report Bookmarklets

This repository contains a bookmarklet for the Jobber web app that helps prepare and clean up the Timesheets Report page before running a biweekly payroll review.

## What it does

The bookmarklet loads the script in [combined-script.js](./combined-script.js) and runs it against the active page. It is designed to operate only on the Timesheets Report page in Jobber.

The script will:
- prompt for the payroll period and week
- add the payroll subtitle to the report
- ensure all rows are visible in the DataTables table
- remove known non-hourly entries from the summary and detail table
- recalculate totals
- adjust the displayed column layout for the payroll report

## Important usage note

This bookmarklet is intended for use only on the Jobber Timesheets Report page, in preparation for running the biweekly payroll. It is not intended for other Jobber pages or unrelated reports.

If you run it on a different page, it may fail to find the expected report elements and make no changes.

## Creating the bookmarklet

Use the contents of [combined-bookmarklet.js](./combined-bookmarklet.js) as the bookmarklet URL.

### Steps

1. Open your browser bookmarks manager.
2. Create a new bookmark.
3. Give it a clear name such as `Jobber Timesheet Report Cleanup`.
4. In the URL field, paste the full contents of [combined-bookmarklet.js](./combined-bookmarklet.js).
5. Save the bookmark.

### Example

The bookmarklet source can target either the latest release or a specific version.

Using the latest published version:

```javascript
javascript:(function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/AlphaSierraHotel/Timesheet-Rpt-Bookmarklets@latest/combined-script.js';
    script.onload = function() {
        console.log("Script loaded and executed.");
    };
    script.onerror = function() {
        console.error("Failed to load the script.");
    };
    document.body.appendChild(script);
})();
```

Using a specific release version, such as v0.3.0:

```javascript
javascript:(function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/AlphaSierraHotel/Timesheet-Rpt-Bookmarklets@v0.3.0/combined-script.js';
    script.onload = function() {
        console.log("Script loaded and executed.");
    };
    script.onerror = function() {
        console.error("Failed to load the script.");
    };
    document.body.appendChild(script);
})();
```

The repository version tag follows the same format as the release: `v0.3.0`.

## How to run it

1. Sign in to the Jobber web app.
2. Open the Timesheets Report page.
3. Select dates for the payroll period you want to process.
4. Click `Apply` to load the report.
5. Click the bookmarklet you created.
6. Enter the payroll period information when prompted.
7. Allow the script to process the report.

## Repository files

- [combined-bookmarklet.js](./combined-bookmarklet.js) — the bookmarklet source used in the browser
- [combined-script.js](./combined-script.js) — the actual logic that updates the report

## Notes

- This is intended for a specific payroll workflow and specific page structure in Jobber.
- The script is designed to run in the browser as a bookmarklet and is not meant to be used as a standalone Node.js script.
- The names excluded by the script are Base64-encoded to avoid displaying them as plain text in the source. This is only obfuscation: anyone who can access the script can decode them, so do not use this to protect confidential information.

## Managing the exclusion list

The exclusion list is the `NAMES_TO_REMOVE` array near the top of [combined-script.js](./combined-script.js). Each entry is a Base64-encoded name, decoded by the script when it runs.

### Add a name

In PowerShell, encode the exact name as UTF-8:

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('New Name'))
```

Add the resulting string as a quoted entry in `NAMES_TO_REMOVE`, separating it from other entries with a comma. The script currently decodes entries with `atob()`, which handles the existing ASCII names; names containing non-ASCII characters require changing the script's decoder to handle UTF-8.

### Remove a name

Copy the encoded entries from `NAMES_TO_REMOVE` into this PowerShell snippet to see which name each represents:

```powershell
$encoded = @(
    'RnJhbmsgRmFjY2hpbmk=',
    'U2hlcnJ5IEZhY2NoaW5p'
)
$encoded | ForEach-Object {
    [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_))
}
```

Replace the sample strings with the entries from the script. Find the entry for the name you want to remove, then delete that encoded string from `NAMES_TO_REMOVE`.
