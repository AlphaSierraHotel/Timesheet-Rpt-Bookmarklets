javascript:(function() {
    const headers = document.querySelectorAll("#DataTables_Table_0 thead td");
    if (headers.length >= 4) {
        headers[0].style.width = "20%";
        headers[1].style.width = "15%";
        headers[2].style.width = "10%";
        headers[3].style.width = "55%";
    }
})();