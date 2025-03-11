// dataManager.js - Handles data loading, saving, and manipulation
import { CONFIG, globalState } from './main.js';
import { showToast, formatDate, extractDateFromTitle } from './utils.js';
import { setupCategoryFilters, applyFiltersAndSearch } from './filterManager.js';
import { updateCuratedItemsDisplay } from './curationManager.js';

/**
 * Load saved items from localStorage
 */
export function loadSavedItems() {
    try {
        const savedItems = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (savedItems) {
            globalState.curatedItems = JSON.parse(savedItems);
            updateCuratedItemsDisplay();
        }
    } catch (error) {
        console.error('Error loading saved items:', error);
    }
}

/**
 * Save curated items to localStorage
 */
export function saveItems() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(globalState.curatedItems));
        showToast('Items saved successfully!');
    } catch (error) {
        console.error('Error saving items:', error);
        showToast('Error saving items', true);
    }
}

/**
 * Clear all curated items
 */
export function clearCuratedItems() {
    if (globalState.curatedItems.length === 0) return;
    
    if (confirm('Are you sure you want to clear all curated items?')) {
        globalState.curatedItems = [];
        updateCuratedItemsDisplay();
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
}

/**
 * Show URL prompt modal for custom feed loading
 */
export function showUrlPrompt() {
    const modal = document.createElement('div');
    modal.className = 'json-viewer-modal';
    modal.style.width = '400px';
    
    modal.innerHTML = `
        <div class="json-viewer-header">
            <h3 style="margin: 0;">Load News Feed</h3>
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div style="padding: 15px;">
            <input type="text" id="url-input" value="${CONFIG.DEFAULT_URL}" 
                   style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; 
                          background: #2d2d2d; color: #fff; border: 1px solid #444; border-radius: 4px;">
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="background-color: #6c757d;">Cancel</button>
                <button id="load-url-button">Load</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event handler for the load button
    document.getElementById('load-url-button').addEventListener('click', () => {
        const url = document.getElementById('url-input').value.trim();
        modal.remove();
        if (url) {
            loadNews(url);
        }
    });
    
    // Focus the input field
    setTimeout(() => {
        const input = document.getElementById('url-input');
        input.focus();
        input.select();
    }, 100);
}

/**
 * View original JSON data
 */
export function viewOriginalJson() {
    if (globalState.originalJsonData) {
        showJsonViewer(globalState.originalJsonData);
    } else {
        showToast('No news loaded yet!', true);
    }
}

/**
 * Generate curated JSON from selected items
 */
export function generateCuratedJson() {
    if (!globalState.originalJsonData || globalState.curatedItems.length === 0) {
        showToast('No items curated yet!', true);
        return;
    }

    // Create new JSON structure maintaining original format
    const curatedJson = {
        type: globalState.originalJsonData.type || "dailySummary",
        title: globalState.originalJsonData.title || `Daily Summary for ${new Date().toISOString().split('T')[0]}`,
        categories: [],
        date: globalState.originalJsonData.date
    };

    // Group curated items by their original categories
    const itemsByCategory = {};
    globalState.curatedItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
            itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
    });

    // Create categories array with curated content
    Object.keys(itemsByCategory).forEach(categoryTitle => {
        const originalCategory = globalState.originalJsonData.categories.find(cat => cat.title === categoryTitle);
        curatedJson.categories.push({
            title: categoryTitle,
            content: itemsByCategory[categoryTitle],
            topic: originalCategory?.topic || ""
        });
    });

    globalState.currentCuratedJson = curatedJson;
    showJsonViewer(curatedJson);
}

/**
 * Show JSON viewer modal
 * @param {Object} jsonData - The JSON data to display
 */
export function showJsonViewer(jsonData) {
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

/**
 * Main function to load news from URL
 * @param {string} url - URL to load news from
 */
export function loadNews(url = CONFIG.DEFAULT_URL) {
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
            globalState.originalJsonData = jsonData;
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