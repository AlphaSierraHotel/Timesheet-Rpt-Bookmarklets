javascript:(function() {
    var selectElement = document.querySelector('#DataTables_Table_0_length select');
    if (selectElement) {
        var newOption = document.createElement('option');
        newOption.value = '100';
        newOption.text = '100';
        selectElement.appendChild(newOption);
        selectElement.value = '100';
        var event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
    }
})();