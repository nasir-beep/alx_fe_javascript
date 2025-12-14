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

// --- Server Interaction (GET & POST) ---

/**
 * MANDATORY: Fetches mock quotes from the simulated server (JSONPlaceholder).
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
            id: `server-${post.id}`, 
            text: post.title, 
            category: `Server-${post.userId}` 
        }));
        
        return serverQuotes;

    } catch (error) {
        console.error("Failed to fetch quotes from server:", error);
        document.getElementById('quoteDisplay').innerHTML = 
            `<p style="color:red;">Failed to connect to server for sync. Check console.</p>`;
        return []; 
    }
}

/**
 * Simulates sending a new quote to the server using the POST method.
 */
async function postQuoteToServer(quoteObject) {
    const mockPostData = {
        title: quoteObject.text,
        body: `Category: ${quoteObject.category}`,
        userId: 1, 
    };

    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(mockPostData)
        });

        if (!response.ok) {
            throw new Error(`Server post failed with status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Successfully posted new quote to server (Mock ID received):", result.id);
        return true;

    } catch (error) {
        console.error("Error during POST request:", error);
        return false;
    }
}

// --- Step 2 & 3: Data Syncing and Conflict Resolution ---

/**
 * MANDATORY: Implements periodic data fetching, syncing, and conflict resolution.
 * This is the function that replaces syncWithServer.
 */
async function syncQuotes() {
    console.log("Starting data sync (syncQuotes)...");
    
    // 1. Fetch data from server
    const serverQuotes = await fetchQuotesFromServer(); 
    
    if (serverQuotes.length === 0) {
        console.log("Sync skipped due to server error or no data.");
        return;
    }

    let conflictsResolved = 0;
    let newQuotesAdded = 0;
    const quotesBeforeSync = quotes.length; 

    // 2. Conflict Resolution Loop: Server Data Precedence (Last Write Wins)
    serverQuotes.forEach(serverQ => {
        const existingIndex = quotes.findIndex(localQ => localQ.id === serverQ.id);

        if (existingIndex !== -1) {
            // Found a match (or conflict)
            if (quotes[existingIndex].text !== serverQ.text) {
                 conflictsResolved++;
            }
            // Server data takes precedence: overwrite local quote
            quotes[existingIndex] = serverQ;
        } else {
            // New quote from server
            quotes.push(serverQ);
            newQuotesAdded++;
        }
    });
    
    // 3. Update local storage and UI elements
    saveQuotes();
    populateCategories();
    
    // 4. Notification System
    if (conflictsResolved > 0 || newQuotesAdded > 0) {
        alert(`Sync complete! ${newQuotesAdded} new quotes added, ${conflictsResolved} conflicts resolved (Server data won).`);
    } else if (quotes.length > quotesBeforeSync) {
        alert(`Sync complete! ${quotes.length - quotesBeforeSync} quotes added.`);
    }
}

// Start the periodic sync process
setInterval(syncQuotes, SYNC_INTERVAL);


// --- Core UI Functions and Handlers ---

async function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const catInput = document.getElementById('newQuoteCategory');
    
    if (textInput.value && catInput.value) {
        const newId = `local-${Date.now()}`;
        const newQuote = { text: textInput.value, category: catInput.value, id: newId };
        
        // 1. Add locally first
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        
        // 2. Attempt to post to server immediately (simulating commit)
        const postSuccess = await postQuoteToServer(newQuote);

        if (postSuccess) {
            alert("Quote added locally AND successfully posted to server!");
        } else {
            alert("Quote added locally, but failed to post to server. Will rely on next sync.");
        }
        
        textInput.value = '';
        catInput.value = '';
    }
}

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

function createAddQuoteForm() {
    const container = document.getElementById('formContainer');
    container.innerHTML = `
        <h3>Add New Quote (Local & POST to Server)</h3>
        <input id="newQuoteText" type="text" placeholder="Enter quote text" style="width:70%; padding:8px;">
        <input id="newQuoteCategory" type="text" placeholder="Category" style="padding:8px;">
        <button onclick="addQuote()">Add Quote</button>
    `;
}

// --- Import/Export (Stubs retained) ---
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    createAddQuoteForm();
    populateCategories();
    showRandomQuote();
    
    // Initial server sync upon page load
    syncQuotes();
});
