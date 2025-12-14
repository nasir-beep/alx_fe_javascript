// Load quotes from Local Storage or use defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Mindset" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];


function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// --- Core Filtering Logic (Step 2) ---

/**
 * Step 2: Implement the populateCategories function.
 */
function populateCategories() {
    const filter = document.getElementById('categoryFilter');
    
    // Get unique categories using Set
    const uniqueCategories = ['all', ...new Set(quotes.map(q => q.category))];
    
    // Get the last selected filter from Local Storage
    const lastFilter = localStorage.getItem('lastCategoryFilter') || 'all';

    // Build the options HTML
    filter.innerHTML = uniqueCategories
        .map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`)
        .join('');
        
    // Restore the last selected filter (Step 2: Remember the Last Selected Filter)
    filter.value = uniqueCategories.includes(lastFilter) ? lastFilter : 'all';
}

/**
 * Step 2: Implement the filterQuotes function.
  */
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    // Save the selected category to Local Storage (Step 2)
    localStorage.setItem('lastCategoryFilter', selectedCategory);
    
    // Show a new random quote from the filtered list
    showRandomQuote();
}


/**
 * Function to display a random quote based on category filter.
 */
function showRandomQuote() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Filter quotes based on the dropdown selection
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes found for the category: <b>${selectedCategory}</b>.</p>`;
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

    // Advanced DOM Manipulation: Create and append elements
    quoteDisplay.innerHTML = ''; 
    
    const quoteParagraph = document.createElement('p');
    quoteParagraph.textContent = `"${quote.text}"`;
    quoteParagraph.style.fontSize = '1.2em';
    quoteParagraph.style.marginBottom = '5px';

    const categorySpan = document.createElement('span');
    categorySpan.textContent = `- ${quote.category}`;
    categorySpan.classList.add('quote-category');

    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categorySpan);

    // Save the last viewed quote to Session Storage
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}


/**
 * Function to add a new quote dynamically (addQuote).
 */
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const catInput = document.getElementById('newQuoteCategory');
    
    if (textInput.value && catInput.value) {
        quotes.push({ text: textInput.value, category: catInput.value });
        saveQuotes(); // Save the updated quote list
        populateCategories(); // Update the filter dropdown with the new category
        
        textInput.value = '';
        catInput.value = '';
        alert("Quote and category list updated successfully!");
    }
}


// --- Import/Export (Retained from previous step) ---

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


function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
            
            // Filter out duplicates for cleaner data handling
            const newQuotes = importedQuotes.filter(impQ => !quotes.some(q => q.text === impQ.text));
            quotes.push(...newQuotes);
            
            saveQuotes();
            populateCategories();
            alert(`${newQuotes.length} quotes imported successfully!`);
        } catch (e) {
            alert("Error importing file. Please ensure it is a valid JSON array of quotes.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// --- UI Dynamic Construction (Helper function) ---

function createAddQuoteForm() {
    const container = document.getElementById('formContainer');
    // Using innerHTML for complex structures is often cleaner than many createElement calls
    container.innerHTML = `
        <h3>Add New Quote</h3>
        <input id="newQuoteText" type="text" placeholder="Enter quote text" style="width:70%; padding:8px;">
        <input id="newQuoteCategory" type="text" placeholder="Category" style="padding:8px;">
        <button onclick="addQuote()">Add Quote</button>
    `;
}



// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Set up the Add Quote Form
    createAddQuoteForm();
    
    // 2. Populate the Category Filter (and restore the last filter preference)
    populateCategories();
    
    // 3. Display an initial quote based on the restored filter
    showRandomQuote();
});
