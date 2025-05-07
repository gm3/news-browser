// Constants and state
const DEFAULT_URL = "https://elizaos.github.io/knowledge/ai-news/elizaos/json/daily.json";
const STORAGE_KEY = "ai_news_curated_items";
let curatedItems = [];
let originalJsonData = null;
let currentCuratedJson = null;
let activeFilters = [];
let searchTerm = "";

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Set up event listeners
    initializeEventListeners();
    initializeDragAndDrop();
    initializeKeyboardShortcuts();
    
    // Try to load saved items
    loadSavedItems();
    
    // Load news automatically
    loadNews();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Basic controls
    document.getElementById('load-news-btn').addEventListener('click', showUrlPrompt);
    document.getElementById('view-original-json-btn').addEventListener('click', viewOriginalJson);
    document.getElementById('generate-json-btn').addEventListener('click', generateCuratedJson);
    
    // Search
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Curation controls
    document.getElementById('clear-curated-btn').addEventListener('click', clearCuratedItems);
    document.getElementById('save-curated-btn').addEventListener('click', saveItems);
    
    // Keyboard shortcuts toggle
    document.getElementById('toggle-shortcuts').addEventListener('click', toggleShortcutsPanel);
}

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only process if not in an input field
        if (document.activeElement.tagName !== 'INPUT') {
            switch(e.key.toLowerCase()) {
                case 'l':
                    showUrlPrompt();
                    break;
                case 's':
                    document.getElementById('search-input').focus();
                    break;
                case 'v':
                    viewOriginalJson();
                    break;
                case 'g':
                    generateCuratedJson();
                    break;
                case '?':
                    toggleShortcutsPanel();
                    break;
            }
        }
    });
}

// Toggle keyboard shortcuts panel
function toggleShortcutsPanel() {
    const panel = document.querySelector('.shortcuts-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// Load saved items from localStorage
function loadSavedItems() {
    try {
        const savedItems = localStorage.getItem(STORAGE_KEY);
        if (savedItems) {
            curatedItems = JSON.parse(savedItems);
            updateCuratedItemsDisplay();
        }
    } catch (error) {
        console.error('Error loading saved items:', error);
    }
}

// Save curated items to localStorage
function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(curatedItems));
        showToast('Items saved successfully!');
    } catch (error) {
        console.error('Error saving items:', error);
        showToast('Error saving items', true);
    }
}

// Clear all curated items
function clearCuratedItems() {
    if (curatedItems.length === 0) return;
    
    if (confirm('Are you sure you want to clear all curated items?')) {
        curatedItems = [];
        updateCuratedItemsDisplay();
        localStorage.removeItem(STORAGE_KEY);
    }
}

// Perform search
function performSearch() {
    searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    applyFiltersAndSearch();
}

// View original JSON
function viewOriginalJson() {
    if (originalJsonData) {
        showJsonViewer(originalJsonData);
    } else {
        showToast('No news loaded yet!', true);
    }
}

// Show a toast notification
function showToast(message, isError = false) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Automatically remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format date with improved handling
function formatDate(unixTimestamp) {
    // Create date object in UTC to avoid timezone issues
    const date = new Date(unixTimestamp * 1000);
    
    // Get today and yesterday dates for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today or yesterday
    const dateObj = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    
    if (dateObj.setHours(0, 0, 0, 0) === today.getTime()) {
        return 'Today';
    } else if (dateObj.setHours(0, 0, 0, 0) === yesterday.getTime()) {
        return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Extract date from title if needed
function extractDateFromTitle(title) {
    const dateMatch = title.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch && dateMatch[1]) {
        // Create date using UTC to avoid timezone issues
        const [year, month, day] = dateMatch[1].split('-').map(num => parseInt(num, 10));
        // Use UTC date constructor to avoid timezone issues
        const dateObj = new Date(Date.UTC(year, month - 1, day));
        return Math.floor(dateObj.getTime() / 1000);
    }
    return null;
}

// Show URL prompt modal for custom feed loading
function showUrlPrompt() {
    const modal = document.createElement('div');
    modal.className = 'json-viewer-modal';
    modal.style.width = '400px';
    
    modal.innerHTML = `
        <div class="json-viewer-header">
            <h3 style="margin: 0;">Load News Feed</h3>
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div style="padding: 15px;">
            <input type="text" id="url-input" value="${DEFAULT_URL}" 
                   style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; 
                          background: #2d2d2d; color: #fff; border: 1px solid #444; border-radius: 4px;">
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="background-color: #6c757d;">Cancel</button>
                <button onclick="loadNewsFromInput(this.parentElement.parentElement.parentElement)">Load</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus the input field
    setTimeout(() => {
        const input = document.getElementById('url-input');
        input.focus();
        input.select();
    }, 100);
}

// Load news from URL input
function loadNewsFromInput(modal) {
    const url = modal.querySelector('#url-input').value.trim();
    modal.remove();
    if (url) {
        loadNews(url);
    }
}

// Show JSON viewer modal
function showJsonViewer(jsonData) {
    const modal = document.createElement('div');
    modal.className = 'json-viewer-modal';
    
    const header = document.createElement('div');
    header.className = 'json-viewer-header';
    
    const title = document.createElement('h3');
    title.style.margin = '0';
    title.textContent = 'JSON Viewer';
    
    const controls = document.createElement('div');
    controls.className = 'json-viewer-controls';
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy JSON';
    copyBtn.onclick = () => {
        const jsonString = JSON.stringify(jsonData, null, 2);
        navigator.clipboard.writeText(jsonString)
            .then(() => showToast('JSON copied to clipboard!'))
            .catch(err => showToast('Failed to copy JSON', true));
    };
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download JSON';
    downloadBtn.onclick = () => {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `json_data_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('JSON downloaded successfully!');
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    closeBtn.onclick = () => modal.remove();
    
    controls.appendChild(copyBtn);
    controls.appendChild(downloadBtn);
    controls.appendChild(closeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    const content = document.createElement('div');
    content.className = 'json-viewer-content';
    
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(jsonData, null, 2);
    
    content.appendChild(pre);
    modal.appendChild(header);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Generate curated JSON from selected items
function generateCuratedJson() {
    if (!originalJsonData || curatedItems.length === 0) {
        showToast('No items curated yet!', true);
        return;
    }

    // Create new JSON structure maintaining original format
    const curatedJson = {
        type: originalJsonData.type || "dailySummary",
        title: originalJsonData.title || `Daily Summary for ${new Date().toISOString().split('T')[0]}`,
        categories: [],
        date: originalJsonData.date
    };

    // Group curated items by their original categories
    const itemsByCategory = {};
    curatedItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
            itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
    });

    // Create categories array with curated content
    Object.keys(itemsByCategory).forEach(categoryTitle => {
        const originalCategory = originalJsonData.categories.find(cat => cat.title === categoryTitle);
        curatedJson.categories.push({
            title: categoryTitle,
            content: itemsByCategory[categoryTitle],
            topic: originalCategory?.topic || ""
        });
    });

    currentCuratedJson = curatedJson;
    showJsonViewer(curatedJson);
}

// Main function to load news from URL
function loadNews(url = DEFAULT_URL) {
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'flex';
    
    // Disable load button while loading
    document.getElementById('load-news-btn').disabled = true;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsonData => {
            originalJsonData = jsonData;
            const feedContainer = document.getElementById("feed-container");
            feedContainer.innerHTML = "";
            
            // Display date - try to get from date field or extract from title
            let displayDate = "";
            let lastUpdated = "";
            
            if (jsonData.date) {
                displayDate = formatDate(jsonData.date);
                lastUpdated = new Date().toLocaleString();
            } else if (jsonData.title) {
                const extractedDate = extractDateFromTitle(jsonData.title);
                if (extractedDate) {
                    displayDate = formatDate(extractedDate);
                } else {
                    displayDate = jsonData.title;
                }
                lastUpdated = new Date().toLocaleString();
            }
            
            if (displayDate) {
                const dateHeader = document.createElement("h3");
                dateHeader.className = "date-header";
                dateHeader.innerHTML = `
                    <span>${displayDate}</span>
                    <span class="date-refresh">Last refreshed: ${lastUpdated}</span>
                `;
                feedContainer.appendChild(dateHeader);
            }

            // Set up category filters
            setupCategoryFilters(jsonData);

            // Group content by categories
            if (jsonData.categories && Array.isArray(jsonData.categories)) {
                jsonData.categories.forEach((category) => {
                    const categorySection = document.createElement("div");
                    categorySection.classList.add("category-section");
                    categorySection.dataset.category = category.title;
                    
                    const categoryTitle = document.createElement("h2");
                    categoryTitle.classList.add("category-title");
                    
                    // Count the number of items in the category
                    const itemCount = category.content ? category.content.length : 0;
                    
                    categoryTitle.innerHTML = `
                        <span>${category.title}</span>
                        <span class="item-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                    `;
                    categorySection.appendChild(categoryTitle);

                    // Make sure content is an array before iterating
                    if (category.content && Array.isArray(category.content)) {
                        category.content.forEach((item) => {
                            // Store category with the item for later reference
                            item.category = category.title;
                            
                            let card = document.createElement("div");
                            card.classList.add("card");
                            card.draggable = true;
                            card.dataset.text = item.text.toLowerCase();
                            
                            // Handle source links, if available
                            let sourceLinks = '';
                            if (item.sources && Array.isArray(item.sources)) {
                                if (item.sources.length === 1) {
                                    // Single source - just show the link
                                    sourceLinks = `<a href="${item.sources[0]}" target="_blank" class="source-link">${item.sources[0]}</a>`;
                                } else if (item.sources.length > 1) {
                                    // Multiple sources - create toggle list
                                    const toggleId = `sources-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                                    sourceLinks = `
                                        <div class="source-toggle">
                                            <button class="source-toggle-btn" onclick="toggleSourceList('${toggleId}')">
                                                ${item.sources.length} Sources
                                                <span class="toggle-icon">+</span>
                                            </button>
                                            <div id="${toggleId}" class="source-list">
                                                ${item.sources.map(source => 
                                                    `<a href="${source}" target="_blank">${source}</a>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    `;
                                }
                            }

                            // Default image if no images available
                            const imageUrl = (item.images && item.images.length) ? 
                                item.images[0] : 'images/nothumb.png';

                            card.innerHTML = `
                                <div class="card-image">
                                    <img src="${imageUrl}" alt="News thumbnail" onerror="this.src='images/nothumb.png';" />
                                </div>
                                <div class="card-content">
                                    <p>${item.text || "No content available"}</p>
                                    <div class="source-links">
                                        ${sourceLinks}
                                    </div>
                                </div>
                            `;

                            card.addEventListener("dragstart", (e) => {
                                e.dataTransfer.setData("text/plain", JSON.stringify(item));
                                card.classList.add("dragging");
                            });

                            card.addEventListener("dragend", () => {
                                card.classList.remove("dragging");
                            });

                            categorySection.appendChild(card);
                        });
                    }

                    feedContainer.appendChild(categorySection);
                });
                
                // Apply any active filters or search
                applyFiltersAndSearch();
            } else {
                // No categories found or not an array
                feedContainer.innerHTML = "<p style='text-align: center; margin-top: 50px;'>No valid categories found in the data.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching news:", error);
            document.getElementById('feed-container').innerHTML = 
                `<p style='text-align: center; margin-top: 50px; color: #dc3545;'>
                    Error loading news: ${error.message}<br><br>
                    <button onclick="loadNews()">Try Again</button>
                </p>`;
        })
        .finally(() => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            document.getElementById('load-news-btn').disabled = false;
        });
}

// Format URL for display
function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname.substring(0, 15) + (urlObj.pathname.length > 15 ? '...' : '');
    } catch (e) {
        return url.substring(0, 30) + (url.length > 30 ? '...' : '');
    }
}

// Setup category filters based on loaded data
function setupCategoryFilters(jsonData) {
    if (!jsonData || !jsonData.categories) return;
    
    const filterContainer = document.getElementById('category-filter');
    filterContainer.innerHTML = '<button data-category="all" class="active">All</button>';
    
    activeFilters = ['all']; // Reset active filters
    
    jsonData.categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.textContent = category.title;
        filterBtn.dataset.category = category.title;
        
        filterBtn.addEventListener('click', () => {
            toggleCategoryFilter(filterBtn, category.title);
        });
        
        filterContainer.appendChild(filterBtn);
    });
    
    // Add event listener for "All" button
    filterContainer.querySelector('[data-category="all"]').addEventListener('click', () => {
        // Clear all filters and set only "all" active
        document.querySelectorAll('#category-filter button').forEach(btn => {
            btn.classList.remove('active');
        });
        filterContainer.querySelector('[data-category="all"]').classList.add('active');
        activeFilters = ['all'];
        applyFiltersAndSearch();
    });
}

// Toggle category filter selection
function toggleCategoryFilter(button, category) {
    // Unselect "All" if it's active
    if (activeFilters.includes('all')) {
        document.querySelector('#category-filter [data-category="all"]').classList.remove('active');
        activeFilters = [];
    }
    
    // Toggle this category
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        activeFilters = activeFilters.filter(cat => cat !== category);
        
        // If no filters are active, reactivate "All"
        if (activeFilters.length === 0) {
            document.querySelector('#category-filter [data-category="all"]').classList.add('active');
            activeFilters = ['all'];
        }
    } else {
        button.classList.add('active');
        activeFilters.push(category);
    }
    
    applyFiltersAndSearch();
}

// Apply both category filters and search term
function applyFiltersAndSearch() {
    const sections = document.querySelectorAll('.category-section');
    const showAll = activeFilters.includes('all');
    
    sections.forEach(section => {
        const categoryName = section.dataset.category;
        const shouldShowCategory = showAll || activeFilters.includes(categoryName);
        
        if (shouldShowCategory) {
            section.style.display = '';
            
            // Apply search filter within visible categories
            if (searchTerm) {
                const cards = section.querySelectorAll('.card');
                let visibleCards = 0;
                
                cards.forEach(card => {
                    const cardText = card.dataset.text;
                    const matchesSearch = cardText && cardText.includes(searchTerm.toLowerCase());
                    card.style.display = matchesSearch ? '' : 'none';
                    if (matchesSearch) visibleCards++;
                });
                
                // If no cards match search in this category, hide the category
                section.style.display = visibleCards > 0 ? '' : 'none';
            } else {
                // Show all cards if no search term
                section.querySelectorAll('.card').forEach(card => {
                    card.style.display = '';
                });
            }
        } else {
            section.style.display = 'none';
        }
    });
}

// Drag and drop functionality
function initializeDragAndDrop() {
    const dropZone = document.getElementById("drop-zone");
    
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');

        try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (!curatedItems.some(item => item.text === data.text)) {
                curatedItems.push(data);
                updateCuratedItemsDisplay();
                dropZone.classList.add('drop-feedback');
                setTimeout(() => dropZone.classList.remove('drop-feedback'), 300);
                showToast('Item added to curated list');
            } else {
                showToast('Item already in curated list', true);
            }
        } catch (error) {
            console.error('Error processing dropped item:', error);
            showToast('Error adding item', true);
        }
    });
}

// Update the display of curated items
function updateCuratedItemsDisplay() {
    const container = document.querySelector('.curated-items');
    container.innerHTML = "";
    
    // Update the counter
    document.getElementById('curated-count').textContent = curatedItems.length;
    
    curatedItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'curated-item';
        
        // Default image if no images available
        const imageUrl = (item.images && item.images.length) ? 
            item.images[0] : 'images/nothumb.png';
            
        // Truncate text for display
        const displayText = item.text ? 
            (item.text.length > 50 ? item.text.substring(0, 50) + "..." : item.text) : 
            "No content";
        
        // Handle sources for curated items   
        let sourceInfo = '';
        if (item.sources && item.sources.length > 0) {
            sourceInfo = `<div class="curated-item-sources">${item.sources.length} source${item.sources.length > 1 ? 's' : ''}</div>`;
        }
            
        itemElement.innerHTML = `
            <img src="${imageUrl}" alt="Thumbnail" onerror="this.src='images/nothumb.png';" />
            <div class="curated-item-category">${item.category || 'Uncategorized'}</div>
            ${sourceInfo}
            <p>${displayText}</p>
            <button onclick="removeItem(${index})" class="remove-btn">×</button>
        `;
        container.appendChild(itemElement);
    });
}

// Remove item from curated list
function removeItem(index) {
    curatedItems.splice(index, 1);
    updateCuratedItemsDisplay();
    showToast('Item removed from curated list');
}

// Add CSS styles for elements not in the original CSS
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            border-radius: 4px;
            z-index: 1000;
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .toast-notification.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .toast-notification.error {
            background-color: #dc3545;
        }
        
        .curated-item-category {
            position: absolute;
            top: 5px;
            left: 5px;
            background: rgba(0,0,0,0.7);
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
        }
        
        .loading-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        
        .loading-indicator p {
            color: #aaa;
        }
    `;
    document.head.appendChild(style);
});

// Toggle source list visibility
function toggleSourceList(id) {
    const sourceList = document.getElementById(id);
    const button = sourceList.previousElementSibling;
    const icon = button.querySelector('.toggle-icon');
    
    if (sourceList.style.display === 'block') {
        sourceList.style.display = 'none';
        icon.textContent = '+';
    } else {
        sourceList.style.display = 'block';
        icon.textContent = '−';
    }
}

