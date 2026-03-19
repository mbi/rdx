import "./functions.min.js?v=CACHEBUSTER";
import {getSubs} from "./functions";


const base_url = localStorage.getItem('base_url') || 'old.reddit.org';
document.getElementById("base-url").value = base_url;

function save_base_url() {
    localStorage.setItem('base_url', document.getElementById("base-url").value);
}


function exportData() {
    const subs = getSubs();
    if (subs) {
        const data = JSON.parse(subs);
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rdx_subs.json';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert('Please subscribe to some subs before exporting!');
    }
}
document.getElementById("export-data").addEventListener("click", exportData);

// Function to update localStorage with new data
function updateLocalStorage(data) {
    localStorage.setItem('subs', JSON.stringify(data));
}

// Function to display the stored data
function displayStoredData() {
  //  const subsData = exportData();
    document.getElementById('storedData').textContent = JSON.stringify(subsData, null, 2);
}

// Function to import data from a JSON file
function importData() {
    const fileInput = document.getElementById('importInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const importedData = JSON.parse(event.target.result);


                updateLocalStorage(importedData);
               // displayStoredData();
                alert('Data imported successfully.');
            } catch (error) {
                alert(error+'Error importing data. Make sure the file is valid JSON.');
            }
        };

        reader.readAsText(file);
    }
}
document.getElementById("import-data").addEventListener("click", importData);