// 1. Initialize quotes from Local Storage or use default values if empty
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Mindset" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

/**
 * Function to save quotes to Local Storage
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Function to display a random quote based on category filter
 */
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const categoryFilter = document.getElementById('categoryFilter');

    // Safety: Ensure element exists before reading .value
    if (!quoteDisplay || !categoryFilter) {
        console.error("Missing DOM elements: quoteDisplay or categoryFilter.");
        return;
    }

    const selectedCategory = categoryFilter.value;

    // Filter quotes based on the dropdown selection
    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes found for this category.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

    // Clear and build content using Advanced DOM methods
    quoteDisplay.innerHTML = '';

    
    const quoteParagraph = document.createElement('p');
    quoteParagraph.textContent = `"${quote.text}"`;
    quoteParagraph.style.fontSize = '1.2em'; 

    
    const categorySpan = document.createElement('span');
    categorySpan.textContent = `Category: ${quote.category}`;
    categorySpan.classList.add('quote-category');
    
    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categorySpan);
}

/**
 * Function to dynamically update the category dropdown
 */
function populateCategories() {
    const filter = document.getElementById('categoryFilter');

    if (!filter) {
        console.error("Category filter element missing.");
        return;
    }

    const currentSelection = filter.value;

    // Get unique categories using Set
    const categories = ['all', ...new Set(quotes.map(q => q.category))];

    filter.innerHTML = ''; // Clear existing
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        filter.appendChild(option);
    });

    // Keep the user's previous selection if still available
    filter.value = categories.includes(currentSelection) ? currentSelection : 'all';
}

/**
 * Function to dynamically create the Add Quote Form
 */
function createAddQuoteForm() {
    const formContainer = document.getElementById('formContainer');

    if (!formContainer) {
        console.error("formContainer div is missing in HTML.");
        return;
    }

    formContainer.innerHTML = '<h2>Add a New Quote</h2>';

    const inputQuote = document.createElement('input');
    inputQuote.id = 'newQuoteText';
    inputQuote.placeholder = 'Quote Text';

    const inputCat = document.createElement('input');
    inputCat.id = 'newQuoteCategory';
    inputCat.placeholder = 'Category';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Quote';

    addBtn.onclick = () => {
        const text = inputQuote.value.trim();
        const category = inputCat.value.trim();

        if (text && category) {
            quotes.push({ text, category });
            saveQuotes();
            populateCategories();
            inputQuote.value = '';
            inputCat.value = '';
            alert('Quote added successfully!');
        } else {
            alert('Please fill in both fields.');
        }
    };

    formContainer.append(inputQuote, inputCat, addBtn);
}

/**
 * Initialization and Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Ensure quoteDisplay exists
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (!quoteDisplay) {
        console.error("Missing <div id='quoteDisplay'></div> in HTML.");
        return;
    }

    // Create category filter dropdown dynamically
    let filterContainer = document.getElementById('filterContainer');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'filterContainer';
        filterContainer.innerHTML = `
            <label>Filter by Category: </label>
            <select id="categoryFilter"></select>
        `;
        document.body.insertBefore(filterContainer, quoteDisplay);
    }

    document.getElementById('categoryFilter').addEventListener('change', showRandomQuote);

    const newQuoteBtn = document.getElementById('newQuote');
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', showRandomQuote);
    }

    // Initialize UI
    createAddQuoteForm();
    populateCategories();
    showRandomQuote();
});
