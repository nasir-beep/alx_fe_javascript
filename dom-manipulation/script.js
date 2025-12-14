// --- Global Configuration ---
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 10000; // Sync every 10 seconds (for simulation)

// --- Initialization & Data Management ---

// Load quotes from Local Storage or use defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Work", id: 'local-1' },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration", id: 'local-2' }
];


function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// --- Step 1: Simulate Server Interaction (New Function) ---

/**
 * MANDATORY: Fetches mock quotes from the simulated server (JSONPlaceholder)
 * and maps them to our quote object structure.
 * @returns {Array} Array of quotes fetched from the server.
 */
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
    
        const serverData = await response.json();
        
        // Map posts to our quote format (using only the first 5 for simulation)
        const serverQuotes = serverData.slice(0, 5).map(post => ({
            // Assign a unique server ID
            id: `server-${post.id}`, 
            text: post.title, 
            category: `Server-${post.userId}` 
        }));
        
        return serverQuotes;

    } catch (error) {
        console.error("Failed to fetch quotes from server:", error);
        document.getElementById('quoteDisplay').innerHTML = 
            `<p style="color:red;">Failed to connect to server for sync. Check console.</p>`;
        return []; // Return empty array on failure
    }
}

// --- Step 2 & 3: Data Syncing and Conflict Resolution ---

/**
 * Implements periodic data fetching, syncing, and conflict resolution.
 */
async function syncWithServer() {
    console.log("Starting data sync...");
    
    // Call the new dedicated function
    const serverQuotes = await fetchQuotesFromServer(); 
    
    if (serverQuotes.length === 0) {
        console.log("Sync skipped due to server error or no data.");
        return;
    }

    let conflictsResolved = 0;
    let newQuotesAdded = 0;
    
    // Save current length for comparison
    const quotesBeforeSync = quotes.length; 

    // Conflict Resolution Loop: Server Data Precedence (Last Write Wins)
    serverQuotes.forEach(serverQ => {
        const existingIndex = quotes.findIndex(localQ => localQ.id === serverQ.id);

        if (existingIndex !== -1) {
            // Case 1: Conflict/Match found (ID match)
            if (quotes[existingIndex].text !== serverQ.text) {
                 conflictsResolved++;
            }
            // Server data takes precedence: overwrite local quote
            quotes[existingIndex] = serverQ;
        } else {
            // Case 2: New quote from server
            quotes.push(serverQ);
            newQuotesAdded++;
        }
    });
    
    // Update local storage and UI elements
    saveQuotes();
    populateCategories();
    
    // Step 3: Notification System
    if (conflictsResolved > 0 || newQuotesAdded > 0) {
        alert(`Sync complete! ${newQuotesAdded} new quotes added, ${conflictsResolved} conflicts resolved (Server data won).`);
    } else if (quotes.length > quotesBeforeSync) {
        alert(`Sync complete! ${quotes.length - quotesBeforeSync} quotes added.`);
    }
}

// Start the periodic sync process
setInterval(syncWithServer, SYNC_INTERVAL);


// --- Core UI Functions (Retained from previous step) ---

function showRandomQuote() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');

    
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes found for the category: <b>${selectedCategory}</b>.</p>`;
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];


    quoteDisplay.innerHTML = ''; 
    
    const quoteParagraph = document.createElement('p');
    quoteParagraph.textContent = `"${quote.text}"`;


    const categorySpan = document.createElement('span');
    categorySpan.textContent = `- ${quote.category} (ID: ${quote.id || 'N/A'})`; 
    categorySpan.classList.add('quote-category');

    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categorySpan);


    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function populateCategories() {
    const filter = document.getElementById('categoryFilter');
    const uniqueCategories = ['all', ...new Set(quotes.map(q => q.category))];
    const lastFilter = localStorage.getItem('lastCategoryFilter') || 'all';

    filter.innerHTML = uniqueCategories
        .map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`)
        .join('');
        
    filter.value = uniqueCategories.includes(lastFilter) ? lastFilter : 'all';
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('lastCategoryFilter', selectedCategory);
    showRandomQuote();
}

function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const catInput = document.getElementById('newQuoteCategory');
    
    if (textInput.value && catInput.value) {
        // Assign a temporary unique ID for new local quotes
        const newId = `local-${Date.now()}`;
        quotes.push({ text: textInput.value, category: catInput.value, id: newId });
        saveQuotes();
        populateCategories();
        
        textInput.value = '';
        catInput.value = '';
        alert("Quote added locally. Will sync with server soon.");
    }
}

function createAddQuoteForm() {
    const container = document.getElementById('formContainer');
    
    container.innerHTML = `
        <h3>Add New Quote (Local)</h3>
        <input id="newQuoteText" type="text" placeholder="Enter quote text" style="width:70%; padding:8px;">
        <input id="newQuoteCategory" type="text" placeholder="Category" style="padding:8px;">
        <button onclick="addQuote()">Add Quote</button>
    `;
}

// --- Import/Export (Stubs retained) ---
function exportToJsonFile() { /* ... implementation ... */ }
function importFromJsonFile(event) { /* ... implementation ... */ }

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    
    createAddQuoteForm();
    
    populateCategories();
   
    showRandomQuote();
    
    // Initial server sync upon page load
    syncWithServer();
});
