// --- Initialization & Data Management ---

// Step 1: Load quotes from Local Storage or defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "The mind is everything. What you think you become.", category: "Mindset" }
];


function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// --- Core Functionality ---

function showRandomQuote() {
    const filter = document.getElementById('categoryFilter').value;
    const filtered = filter === 'all' ? quotes : quotes.filter(q => q.category === filter);
    
    if (filtered.length === 0) return;

    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    const display = document.getElementById('quoteDisplay');
    
    display.innerHTML = `<p>"${quote.text}"</p><span class="quote-category">- ${quote.category}</span>`;

    // Step 1 (Session Storage): Remember the last viewed quote
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function filterQuotes() {
    showRandomQuote();
}

/**
 * Step 2: JSON Export Functionality
 */
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
}

/**
 * Step 2: JSON Import Functionality
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
            
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            alert('Quotes imported successfully!');
        } catch (e) {
            alert("Error importing file. Please ensure it is a valid JSON array of quotes.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// --- UI Dynamic Construction ---

function populateCategories() {
    const filter = document.getElementById('categoryFilter')
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    
    filter.innerHTML = categories
        .map(cat => `<option value="${cat}">${cat}</option>`)
        .join('');
}

function createAddQuoteForm() {
    const container = document.getElementById('formContainer');
    container.innerHTML = `
        <h3>Add New Quote</h3>
        <input id="newQuoteText" type="text" placeholder="Enter quote text" style="width:70%; padding:8px;">
        <input id="newQuoteCategory" type="text" placeholder="Category" style="padding:8px;">
        <button onclick="addQuote()">Add Quote</button>
    `;
}

function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const catInput = document.getElementById('newQuoteCategory');
    
    if (textInput.value && catInput.value) {
        quotes.push({ text: textInput.value, category: catInput.value });
        saveQuotes();
        populateCategories();
        textInput.value = '';
        catInput.value = '';
        alert("Quote saved to Local Storage!");
    }
}

// --- On Load ---
document.addEventListener('DOMContentLoaded', () => {
    createAddQuoteForm();
    populateCategories();

    // Check session storage for the last viewed quote
    const lastQuote = sessionStorage.getItem('lastQuote');
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        document.getElementById('quoteDisplay').innerHTML = 
            `<p>"${quote.text}"</p><span class="quote-category">- ${quote.category} (Last viewed)</span>`;
    } else {
        showRandomQuote();
    }
});
