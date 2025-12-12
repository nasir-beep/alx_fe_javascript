// Step 2: Initialize the quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Mindset" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteButton = document.getElementById('addQuoteBtn');

/**
 * Step 2: Function to display a random quote (showRandomQuote)
 */
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available yet. Add one!</p>';
        return;
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Clear previous content
    quoteDisplay.innerHTML = ''; 

    // **Advanced DOM Manipulation**
    // 1. Create a paragraph element for the quote text
    const quoteParagraph = document.createElement('p');
    quoteParagraph.textContent = `"${quote.text}"`;
    quoteParagraph.style.fontSize = '1.2em';
    quoteParagraph.style.marginBottom = '5px';

    // 2. Create a span element for the category
    const categorySpan = document.createElement('span');
    categorySpan.textContent = `Category: ${quote.category}`;
    categorySpan.classList.add('quote-category');

    // 3. Append the new elements to the display container
    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categorySpan);
}

/**
 * Step 3: Function to add a new quote dynamically (addQuote)
 */
function addQuote() {
    // Get trimmed values from input fields
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    // Basic validation
    if (text === "" || category === "") {
        alert("Please enter both the quote text and its category.");
        return;
    }

    // Create the new quote object
    const newQuote = { text, category };

    // Update the quotes array
    quotes.push(newQuote);

    // Provide user feedback and clear the form
    alert(`Successfully added new quote: "${text}" in category: ${category}`);
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Immediately show the new quote (optional, but good for UX)
    // showRandomQuote(); 
    
    // Log the updated array to the console for verification
    console.log("Updated Quotes Array:", quotes);
}

// **Event Listeners for Interaction**

// Attach event listener to the 'Show New Quote' button
newQuoteButton.addEventListener('click', showRandomQuote);

// Attach event listener to the 'Add Quote' button (Modern approach instead of inline onclick)
addQuoteButton.addEventListener('click', addQuote);

// Initialize: Show a quote when the page first loads
document.addEventListener('DOMContentLoaded', showRandomQuote);
