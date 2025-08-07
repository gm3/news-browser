/**
 * Main application file for News Browser
 * Modular architecture with ReactBits integration
 */

// Import utilities
import { safeAddEventListener } from '../utils/domUtils.js';
import { convertJsonFormat, extractItemText, getSourceLinks, getImageUrl } from '../utils/dataUtils.js';
import { formatDate, parseBriefingDate } from '../utils/dateUtils.js';

// Import services
import { loadNews } from '../services/newsService.js';
import { 
    loadSavedItems, 
    saveItems, 
    clearSavedItems, 
    addCuratedItem, 
    removeCuratedItem 
} from '../services/storageService.js';
import { 
    fetchAvailableDates, 
    getCurrentDate, 
    formatDateForDisplay, 
    navigateToDate 
} from '../services/dateService.js';

// Import components
import { showToast, createToastStyles } from '../components/Toast.js';
import { showJsonViewer, showUrlPrompt, createModalStyles } from '../components/Modal.js';
import { showCalendar, createCalendarStyles } from '../components/Calendar.js';

// Constants and state
const DEFAULT_URL = "https://elizaos.github.io/knowledge/the-council/facts/daily.json";
let curatedItems = [];
let originalJsonData = null;
let currentCuratedJson = null;
let activeFilters = [];
let searchTerm = "";
let availableDates = [];
let currentDateIndex = 0;
let currentDate = getCurrentDate();
let viewingDaily = true; // separate state to disambiguate daily.json vs dated files

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Create component styles
    createToastStyles();
    createModalStyles();
    createCalendarStyles();
    
    // Set up event listeners
    initializeEventListeners();
    initializeDragAndDrop();
    initializeKeyboardShortcuts();
    
    // Try to load saved items
    loadSavedItemsFromStorage();
    
    // Initialize date navigation
    initializeDateNavigation();
    
    // Load news automatically
    loadNewsFromUrl();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Basic controls
    safeAddEventListener('load-news-btn', 'click', () => showUrlPrompt(DEFAULT_URL, loadNewsFromUrl));
    safeAddEventListener('view-original-json-btn', 'click', viewOriginalJson);
    safeAddEventListener('generate-json-btn', 'click', generateCuratedJson);
    
    // Search
    safeAddEventListener('search-btn', 'click', performSearch);
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Curation controls
    safeAddEventListener('clear-curated-btn', 'click', clearCuratedItems);
    safeAddEventListener('save-curated-btn', 'click', saveCuratedItems);
    
    // Date navigation
    safeAddEventListener('prev-date-btn', 'click', navigateToPreviousDate);
    safeAddEventListener('next-date-btn', 'click', navigateToNextDate);
    safeAddEventListener('today-btn', 'click', navigateToToday);
    safeAddEventListener('calendar-btn', 'click', showDateCalendar);
    
    // Live News Viewer
    safeAddEventListener('live-news-viewer-btn', 'click', openLiveNewsViewer);
    
    // Category filter toggle
    safeAddEventListener('toggle-filters-btn', 'click', toggleCategoryFilters);
    
    // Layout toggle
    safeAddEventListener('toggle-layout-btn', 'click', toggleLayoutMode);
    
    // Panel controls
    safeAddEventListener('open-curation-btn', 'click', () => openPanel('curation'));
    safeAddEventListener('open-chatbot-btn', 'click', () => openPanel('chatbot'));
    safeAddEventListener('close-panel-btn', 'click', closePanel);
    
    // Chatbot controls
    safeAddEventListener('send-chat-btn', 'click', sendChatMessage);
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
    
    // Keyboard shortcuts toggle
    safeAddEventListener('toggle-shortcuts', 'click', toggleShortcutsPanel);
    
    // Mobile menu controls
    safeAddEventListener('hamburger-btn', 'click', toggleMobileMenu);
    safeAddEventListener('mobile-close-btn', 'click', closeMobileMenu);
    
    // Mobile date navigation
    safeAddEventListener('mobile-prev-date-btn', 'click', () => {
        navigateToPreviousDate();
        updateMobileDateDisplay();
    });
    safeAddEventListener('mobile-next-date-btn', 'click', () => {
        navigateToNextDate();
        updateMobileDateDisplay();
    });
    safeAddEventListener('mobile-today-btn', 'click', () => {
        navigateToToday();
        updateMobileDateDisplay();
    });
    safeAddEventListener('mobile-calendar-btn', 'click', () => {
        closeMobileMenu();
        showDateCalendar();
    });
    
    safeAddEventListener('mobile-load-news-btn', 'click', () => {
        closeMobileMenu();
        showUrlPrompt(DEFAULT_URL, loadNewsFromUrl);
    });
    safeAddEventListener('mobile-view-json-btn', 'click', () => {
        closeMobileMenu();
        viewOriginalJson();
    });
    safeAddEventListener('mobile-generate-btn', 'click', () => {
        closeMobileMenu();
        generateCuratedJson();
    });
    safeAddEventListener('mobile-live-btn', 'click', () => {
        closeMobileMenu();
        openLiveNewsViewer();
    });
    safeAddEventListener('mobile-curation-btn', 'click', () => {
        closeMobileMenu();
        openPanel('curation');
    });
    safeAddEventListener('mobile-chatbot-btn', 'click', () => {
        closeMobileMenu();
        openPanel('chatbot');
    });
    safeAddEventListener('mobile-search-btn', 'click', performMobileSearch);
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performMobileSearch();
        });
    }
}

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only process if not in an input field
        if (document.activeElement.tagName !== 'INPUT') {
            switch(e.key.toLowerCase()) {
                case 'l':
                    showUrlPrompt(DEFAULT_URL, loadNewsFromUrl);
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
                case 'arrowleft':
                    navigateToPreviousDate();
                    break;
                case 'arrowright':
                    navigateToNextDate();
                    break;
                case 'c':
                    showDateCalendar();
                    break;
                case 't':
                    navigateToToday();
                    break;
            }
        }
    });
}

/**
 * Toggle keyboard shortcuts panel
 */
function toggleShortcutsPanel() {
    const panel = document.querySelector('.shortcuts-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

/**
 * Toggle category filters visibility
 */
function toggleCategoryFilters() {
    const filterContainer = document.getElementById('category-filter');
    const toggleBtn = document.getElementById('toggle-filters-btn');
    
    if (filterContainer.classList.contains('collapsed')) {
        filterContainer.classList.remove('collapsed');
        filterContainer.classList.add('expanded');
        toggleBtn.textContent = '🔧';
        toggleBtn.title = 'Hide Filters';
    } else {
        filterContainer.classList.remove('expanded');
        filterContainer.classList.add('collapsed');
        toggleBtn.textContent = '🔧';
        toggleBtn.title = 'Show Filters';
    }
}

/**
 * Load saved items from localStorage
 */
function loadSavedItemsFromStorage() {
    curatedItems = loadSavedItems();
    updateCuratedItemsDisplay();
}

/**
 * Save curated items to localStorage
 */
function saveCuratedItems() {
    const success = saveItems(curatedItems);
    showToast(success ? 'Items saved successfully!' : 'Error saving items', !success);
}

/**
 * Clear all curated items
 */
function clearCuratedItems() {
    if (curatedItems.length === 0) return;
    
    if (confirm('Are you sure you want to clear all curated items?')) {
        curatedItems = [];
        updateCuratedItemsDisplay();
        clearSavedItems();
        showToast('All curated items cleared');
    }
}

/**
 * Perform search
 */
function performSearch() {
    searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    applyFiltersAndSearch();
}

/**
 * View original JSON
 */
function viewOriginalJson() {
    if (originalJsonData) {
        showJsonViewer(originalJsonData);
    } else {
        showToast('No news loaded yet!', true);
    }
}

/**
 * Generate curated JSON from selected items
 */
function generateCuratedJson() {
    if (!originalJsonData || curatedItems.length === 0) {
        showToast('No items curated yet!', true);
        return;
    }

    // Convert original data to array format for processing
    const convertedOriginalData = convertJsonFormat(originalJsonData);

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
        const originalCategory = convertedOriginalData.categories.find(cat => cat.title === categoryTitle);
        curatedJson.categories.push({
            title: categoryTitle,
            content: itemsByCategory[categoryTitle],
            topic: originalCategory?.topic || ""
        });
    });

    currentCuratedJson = curatedJson;
    showJsonViewer(curatedJson);
}

/**
 * Load news from URL
 */
async function loadNewsFromUrl(url = DEFAULT_URL) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadNewsBtn = document.getElementById('load-news-btn');
    const feedContainer = document.getElementById("feed-container");

    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    if (loadNewsBtn) {
        loadNewsBtn.disabled = true;
    }
    
    try {
        // Track whether we are viewing the rolling daily feed vs. a fixed dated file
        viewingDaily = (url === DEFAULT_URL);
        const newsData = await loadNews(url);
        originalJsonData = newsData.originalData;
        // Expose current data for layout population helpers
        window.currentJsonData = originalJsonData;
        // Populate the 3-column newspaper carousels
        populateNewspaperLayout(originalJsonData);
        // Also populate masonry layout
        populateMasonryLayout(originalJsonData);
        
        if (feedContainer) {
            feedContainer.innerHTML = "";
            
            setupCategoryFilters(newsData.convertedData);

            if (newsData.convertedData.categories && Array.isArray(newsData.convertedData.categories)) {
                newsData.convertedData.categories.forEach((category) => {
                    const categorySection = createCategorySection(category);
                    feedContainer.appendChild(categorySection);
                });
                applyFiltersAndSearch();
            } else {
                feedContainer.innerHTML = "<p style='text-align: center; margin-top: 50px;'>No valid categories found in the data.</p>";
            }
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        if (feedContainer) {
            feedContainer.innerHTML = 
                `<p style='text-align: center; margin-top: 50px; color: #dc3545;'>
                    Error loading news: ${error.message}<br><br>
                    <button onclick="loadNewsFromUrl()">Try Again</button>
                </p>`;
        }
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (loadNewsBtn) {
            loadNewsBtn.disabled = false;
        }
    }
}

/**
 * Create category section
 */
function createCategorySection(category) {
    const categorySection = document.createElement("div");
    categorySection.classList.add("category-section");
    categorySection.dataset.category = category.title;
    
    const categoryTitle = document.createElement("h2");
    categoryTitle.classList.add("category-title");
    
    const itemCount = category.content ? category.content.length : 0;
    
    categoryTitle.innerHTML = `
        <span>${category.title}</span>
        <span class="item-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
    `;
    categorySection.appendChild(categoryTitle);

    if (category.content && Array.isArray(category.content)) {
        category.content.forEach((item) => {
            const card = createNewsCard(item, category.title);
            categorySection.appendChild(card);
        });
    }
    
    return categorySection;
}

/**
 * Create news card
 */
function createNewsCard(item, categoryTitle) {
    item.category = categoryTitle;
    let card = document.createElement("div");
    card.classList.add("card");
    card.dataset.category = (categoryTitle || '').toLowerCase();
    card.draggable = true;
    
    const itemText = extractItemText(item);
    card.dataset.text = itemText.toLowerCase();
    
    const sourceLinks = getSourceLinks(item);
    const imageUrl = getImageUrl(item);

    card.innerHTML = `
        <div class="curate-toggle">
            <input type="checkbox" title="Curate this item" onchange="window.__curateToggle(this, '${encodeURIComponent(JSON.stringify(item))}')" />
            <label>Curate</label>
        </div>
        <div class="card-image">
            <img src="${imageUrl}" alt="News thumbnail" onerror="this.src='images/nothumb.png';" />
        </div>
        <div class="card-content">
            <p>${itemText || "No content available"}</p>
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

    // Click opens modal
    card.addEventListener('click', () => openCardDetailModal({
        title: item.title || item.claim || 'Details',
        content: item.summary || item.text || item.feedback_summary || extractItemText(item),
        category: categoryTitle,
        source: item.source,
        sources: item.sources
    }));

    return card;
}

/**
 * Setup category filters based on loaded data
 */
function setupCategoryFilters(jsonData) {
    const filterContainer = document.getElementById('category-filter');
    if (!jsonData || !jsonData.categories || !filterContainer) return;
    
    // Convert to array format if needed
    const convertedData = convertJsonFormat(jsonData);
    if (!convertedData || !Array.isArray(convertedData.categories)) return;
    
    filterContainer.innerHTML = '<button data-category="all" class="active">All</button>';
    
    activeFilters = ['all']; // Reset active filters
    
    convertedData.categories.forEach(category => {
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
    
    // Ensure filters start collapsed
    filterContainer.classList.add('collapsed');
    filterContainer.classList.remove('expanded');
}

/**
 * Toggle category filter selection
 */
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

/**
 * Apply both category filters and search term
 */
function applyFiltersAndSearch() {
    // Original feed filter (legacy list view)
    const sections = document.querySelectorAll('.category-section');
    const showAll = activeFilters.includes('all');
    sections.forEach(section => {
        const categoryName = section.dataset.category;
        const shouldShowCategory = showAll || activeFilters.some(f => categoryName.toLowerCase().includes(f.toLowerCase()));
        if (!shouldShowCategory) { section.style.display = 'none'; return; }

        section.style.display = '';
        const cards = section.querySelectorAll('.card');
        if (searchTerm) {
            let visibleCards = 0;
            cards.forEach(card => {
                const cardText = (card.dataset.text || '').toLowerCase();
                const matchesSearch = cardText.includes(searchTerm);
                card.style.display = matchesSearch ? '' : 'none';
                if (matchesSearch) visibleCards++;
            });
            section.style.display = visibleCards > 0 ? '' : 'none';
        } else {
            cards.forEach(card => (card.style.display = '')); 
        }
    });

    // Newspaper layout filter
    filterNewspaperLayout();

    // Masonry layout filter
    filterMasonryLayout();
}

function filterNewspaperLayout() {
    const showAll = activeFilters.includes('all');
    const subRows = document.querySelectorAll('.newspaper-layout .sub-carousel');
    subRows.forEach(row => {
        const labelEl = row.querySelector('.sub-title');
        const rowCategory = labelEl ? labelEl.textContent.trim() : '';
        const categoryPass = showAll || activeFilters.some(f => rowCategory.toLowerCase().includes(f.toLowerCase()));

        const cards = row.querySelectorAll('.newspaper-card');
        let visibleCards = 0;
        cards.forEach(card => {
            const text = (card.dataset.text || '').toLowerCase();
            const cat = (card.dataset.category || '').toLowerCase();
            const matchesSearch = searchTerm ? text.includes(searchTerm) : true;
            const matchesCategory = categoryPass || activeFilters.some(f => cat.includes(f.toLowerCase()));
            const show = matchesSearch && matchesCategory;
            card.style.display = show ? '' : 'none';
            if (show) visibleCards++;
        });

        row.style.display = categoryPass && (searchTerm ? visibleCards > 0 : true) ? '' : 'none';
    });
}

function filterMasonryLayout() {
    const showAll = activeFilters.includes('all');
    const cards = document.querySelectorAll('#masonry-layout .masonry-card');
    cards.forEach(card => {
        const text = (card.dataset.text || '').toLowerCase();
        const cat = (card.dataset.category || '').toLowerCase();
        const matchesSearch = searchTerm ? text.includes(searchTerm) : true;
        const matchesCategory = showAll || activeFilters.some(f => cat.includes(f.toLowerCase()));
        card.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

/**
 * Initialize drag and drop functionality
 */
function initializeDragAndDrop() {
    const dropZone = document.getElementById("drop-zone");
    
    if (dropZone) {
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
                const result = addCuratedItem(curatedItems, data);
                
                if (result.success) {
                    curatedItems = result.items;
                    updateCuratedItemsDisplay();
                    dropZone.classList.add('drop-feedback');
                    setTimeout(() => dropZone.classList.remove('drop-feedback'), 300);
                    showToast(result.message);
                } else {
                    showToast(result.message, true);
                }
            } catch (error) {
                console.error('Error processing dropped item:', error);
                showToast('Error adding item', true);
            }
        });
    }
}

/**
 * Update the display of curated items
 */
function updateCuratedItemsDisplay() {
    const container = document.querySelector('.curated-items');
    container.innerHTML = "";
    
    // Update the counter
    document.getElementById('curated-count').textContent = curatedItems.length;
    
    curatedItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'curated-item';
        
        // Default image if no images available
        const imageUrl = getImageUrl(item);
            
        // Handle different item structures for display
        let displayText = extractItemText(item);
        
        // Truncate text for display
        if (displayText.length > 50) {
            displayText = displayText.substring(0, 50) + "...";
        }
        
        // Handle sources for curated items   
        let sourceInfo = '';
        if (item.source && item.source.length > 0) {
            sourceInfo = `<div class="curated-item-sources">${item.source.length} source${item.source.length > 1 ? 's' : ''}</div>`;
        } else if (item.sources && item.sources.length > 0) {
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

/**
 * Remove item from curated list
 */
function removeItem(index) {
    const result = removeCuratedItem(curatedItems, index);
    if (result.success) {
        curatedItems = result.items;
        updateCuratedItemsDisplay();
        showToast(result.message);
    } else {
        showToast(result.message, true);
    }
}

/**
 * Toggle source list visibility
 */
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

// Make functions globally available for onclick handlers
window.removeItem = removeItem;
window.toggleSourceList = toggleSourceList;
window.__curateToggle = (el, encoded) => {
    try {
        const item = JSON.parse(decodeURIComponent(encoded));
        handleCurateToggle(el.checked, item);
    } catch (e) {
        console.error('Curate toggle parse error', e);
    }
};

/**
 * Initialize date navigation
 */
async function initializeDateNavigation() {
    try {
        // Show loading state
        const displayElement = document.getElementById('current-date-display');
        if (displayElement) {
            displayElement.textContent = 'Loading dates...';
        }
        
        availableDates = await fetchAvailableDates();
        
        // Only update buttons after dates are loaded
        updateDateDisplay();
        updateDateNavigationButtons();
        
        if (availableDates.length > 0) {
            showToast(`Loaded ${availableDates.length} available dates`);
            // Ensure currentDate aligns to our offset "today"
            currentDate = getCurrentDate();
            updateDateDisplay();
            updateDateNavigationButtons();
        }
    } catch (error) {
        console.error('Error initializing date navigation:', error);
        showToast('Error loading available dates', true);
        
        // Reset display on error
        const displayElement = document.getElementById('current-date-display');
        if (displayElement) {
            displayElement.textContent = 'Today';
        }
    }
}

/**
 * Update the date display
 */
function updateDateDisplay() {
    const displayElement = document.getElementById('current-date-display');
    const mobileDisplayElement = document.getElementById('mobile-current-date-display');
    
    const displayText = viewingDaily ? 'Today' : formatDateForDisplay(currentDate);
    
    if (displayElement) {
        displayElement.textContent = displayText;
    }
    
    if (mobileDisplayElement) {
        mobileDisplayElement.textContent = displayText;
    }
}

/**
 * Update date navigation buttons state
 */
function updateDateNavigationButtons() {
    const prevBtn = document.getElementById('prev-date-btn');
    const nextBtn = document.getElementById('next-date-btn');
    
    if (prevBtn && nextBtn) {
        if (viewingDaily) {
            // When viewing daily.json, we can go back to the most recent historical date
            // but we can't go forward since we're already at "today"
            prevBtn.disabled = availableDates.length === 0;
            nextBtn.disabled = true; // Can't go forward from today
        } else {
            // When viewing a historical date, find its index
            let currentIndex = availableDates.findIndex(d => d.date === currentDate);
            
            // If not found, use the first available date
            if (currentIndex === -1 && availableDates.length > 0) {
                currentIndex = 0;
            }
            
            // Since dates are sorted descending (newest first):
            // - "Previous" (older) is disabled when at the last index (oldest date)
            // - "Next" (newer) is disabled when at the first index (newest date)
            prevBtn.disabled = currentIndex >= availableDates.length - 1;
            nextBtn.disabled = currentIndex <= 0;
        }
    }
}

/**
 * Navigate to previous date (older date)
 */
function navigateToPreviousDate() {
    if (viewingDaily) {
        // When viewing daily.json, go to the most recent historical date
        if (availableDates.length > 0) {
            const mostRecentDate = availableDates[0].date;
            navigateToDate(mostRecentDate, loadNewsFromUrl);
            currentDate = mostRecentDate;
            viewingDaily = false;
            updateDateDisplay();
            updateDateNavigationButtons();
        }
    } else {
        // When viewing a historical date, find its index and go to the previous one
        let currentIndex = availableDates.findIndex(d => d.date === currentDate);
        
        // Since dates are sorted descending (newest first), 
        // "previous" means going to a higher index (older date)
        if (currentIndex < availableDates.length - 1) {
            const newDate = availableDates[currentIndex + 1].date;
            navigateToDate(newDate, loadNewsFromUrl);
            currentDate = newDate;
            viewingDaily = false;
            updateDateDisplay();
            updateDateNavigationButtons();
        }
    }
}

/**
 * Navigate to next date (newer date)
 */
function navigateToNextDate() {
    if (viewingDaily) {
        // When viewing daily.json, we can't go forward since we're already at "today"
        return;
    } else {
        // When viewing a historical date, find its index and go to the next one
        let currentIndex = availableDates.findIndex(d => d.date === currentDate);
        
        // Since dates are sorted descending (newest first), 
        // "next" means going to a lower index (newer date)
        if (currentIndex > 0) {
            const newDate = availableDates[currentIndex - 1].date;
            navigateToDate(newDate, loadNewsFromUrl);
            currentDate = newDate;
            viewingDaily = false;
            updateDateDisplay();
            updateDateNavigationButtons();
        } else if (currentIndex === 0) {
            // If we're at the most recent historical date, go back to daily.json
            loadNewsFromUrl(); // Load daily.json
            currentDate = getCurrentDate(); // Set to today
            viewingDaily = true;
            updateDateDisplay();
            updateDateNavigationButtons();
        }
    }
}

/**
 * Navigate to today's date
 */
function navigateToToday() {
    // Always load daily.json for "Today"
    loadNewsFromUrl(); // This loads the default URL (daily.json)
    currentDate = getCurrentDate(); // Set to today
    viewingDaily = true;
    updateDateDisplay();
    updateDateNavigationButtons();
    showToast('Navigated to today');
}

/**
 * Show date calendar
 */
function showDateCalendar() {
    if (availableDates.length === 0) {
        showToast('No dates available', true);
        return;
    }
    
    showCalendar(availableDates, (selectedDate) => {
        // Check if the selected date is today
        const today = getCurrentDate();
        if (selectedDate === today) {
            // If today is selected, navigate to daily.json
            navigateToToday();
        } else {
            // Otherwise navigate to the specific date
            currentDate = selectedDate;
            navigateToDate(selectedDate, loadNewsFromUrl);
            viewingDaily = false;
            updateDateDisplay();
            updateDateNavigationButtons();
        }
    }, currentDate);
}

/**
 * Open Live News Viewer with current data
 */
function openLiveNewsViewer() {
    if (!originalJsonData) {
        showToast('No news data loaded', true);
        return;
    }
    
    // Store the current JSON data in localStorage for the Live News Viewer
    localStorage.setItem('liveNewsData', JSON.stringify(originalJsonData));
    localStorage.setItem('liveNewsUrl', window.location.href);
    
    // Open the Live News Viewer
    window.open('live/livenewsviewer.html', '_blank');
}

/**
 * Panel management functions
 */
function openPanel(panelType) {
    const rightPanel = document.getElementById('right-panel');
    const mainContent = document.querySelector('.main-content');
    const newspaperLayout = document.querySelector('.newspaper-layout');
    const masonryLayout = document.getElementById('masonry-layout');
    const curationPanel = document.getElementById('curation-panel');
    const chatbotPanel = document.getElementById('chatbot-panel');
    
    // Show the panel
    rightPanel.classList.add('open');
    mainContent.classList.add('panel-open');
    if (newspaperLayout) newspaperLayout.classList.add('panel-open');
    if (masonryLayout) masonryLayout.classList.add('panel-open');
    
    // Show the appropriate panel content
    if (panelType === 'curation') {
        curationPanel.style.display = 'flex';
        chatbotPanel.style.display = 'none';
    } else if (panelType === 'chatbot') {
        curationPanel.style.display = 'none';
        chatbotPanel.style.display = 'flex';
    }
    
    showToast(`Opened ${panelType} panel`);
}

function closePanel() {
    const rightPanel = document.getElementById('right-panel');
    const mainContent = document.querySelector('.main-content');
    const newspaperLayout = document.querySelector('.newspaper-layout');
    const masonryLayout = document.getElementById('masonry-layout');
    
    rightPanel.classList.remove('open');
    mainContent.classList.remove('panel-open');
    if (newspaperLayout) newspaperLayout.classList.remove('panel-open');
    if (masonryLayout) masonryLayout.classList.remove('panel-open');
    
    showToast('Panel closed');
}

function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Simulate bot response (you can replace this with actual AI integration)
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerHTML = `<p>I understand you're asking about "${message}". This is a demo response. In a real implementation, this would connect to an AI service for news analysis and curation assistance.</p>`;
        chatMessages.appendChild(botMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Mobile menu functions
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu.classList.contains('open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = ''; // Restore scrolling
}

function performMobileSearch() {
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const searchTerm = mobileSearchInput.value.trim();
    
    if (searchTerm) {
        // Copy the search term to the main search input
        const mainSearchInput = document.getElementById('search-input');
        if (mainSearchInput) {
            mainSearchInput.value = searchTerm;
        }
        
        // Perform the search
        performSearch();
        
        // Close mobile menu
        closeMobileMenu();
        
        showToast(`Searching for: ${searchTerm}`);
    }
}

function updateMobileDateDisplay() {
    // This function is called after date navigation to ensure mobile display is updated
    // The actual update is handled by updateDateDisplay() which now updates both desktop and mobile
    updateDateDisplay();
} 

/**
 * Populate newspaper layout with data
 */
function populateNewspaperLayout(jsonData) {
    if (!jsonData) return;

    // Clear existing content
    clearNewspaperLayout();

    // Normalize categories to array form for both formats
    const converted = convertJsonFormat(jsonData);
    const categoriesArray = Array.isArray(converted?.categories) ? converted.categories : [];

    // Populate columns from normalized categories
    populateMainNewsColumn(categoriesArray, jsonData);
    populateDevelopmentColumn(categoriesArray);
    populateCommunityColumn(categoriesArray);

    // Initialize carousel navigation
    initializeCarouselNavigation();
}

/**
 * Clear all newspaper columns
 */
function clearNewspaperLayout() {
    const columns = ['main-news-carousel', 'dev-news-carousel', 'community-news-carousel'];
    columns.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = '';
    });
}

/**
 * Populate main news column with Twitter highlights and strategic insights
 */
function populateMainNewsColumn(categoriesArray, jsonData) {
    const carousel = document.getElementById('main-news-carousel');
    if (!carousel) return;

    const row = document.createElement('div');
    row.className = 'sub-carousel';

    // Add overall summary as featured card when present
    if (jsonData && jsonData.overall_summary) {
        const featuredRow = createSubCarousel('Summary', [
            createNewspaperCard({
                title: 'Daily Briefing',
                category: 'Summary',
                content: jsonData.overall_summary,
                type: 'summary',
                featured: true
            })
        ]);
        carousel.appendChild(featuredRow);
    }

    // Add categories that match Twitter/Strategic themes in separate rows
    const mainSectionOrder = [
        // 'Twitter News Highlights', // moved to Community & Market column
        'Strategic Insights'
    ];
    mainSectionOrder.forEach(sectionName => {
        const cat = categoriesArray.find(c => c.title.toLowerCase().includes(sectionName.toLowerCase()));
        if (cat) {
            const cards = (cat.content || []).map(item => createNewspaperCard({
                title: item.theme || item.title || item.claim || 'Update',
                category: sectionName,
                content: item.insight || item.summary || item.claim || item.text || item.observation || '',
                implications: item.implications_or_questions,
                sentiment: item.sentiment,
                type: 'main'
            }));
            const rowEl = createSubCarousel(sectionName, cards);
            carousel.appendChild(rowEl);
        }
    });
}

/**
 * Populate development column with GitHub updates and technical developments
 */
function populateDevelopmentColumn(categoriesArray) {
    const carousel = document.getElementById('dev-news-carousel');
    if (!carousel) return;

    // Focus cards first if present
    categoriesArray
        .filter(cat => /focus/i.test(cat.title))
        .forEach(cat => {
            const cards = (cat.content || []).map(item => createNewspaperCard({
                title: 'Development Focus',
                category: 'Focus',
                content: item.claim || item.summary || extractItemText(item),
                featured: true,
                type: 'focus'
            }));
            carousel.appendChild(createSubCarousel('Development Focus', cards));
        });

    // GitHub updates and technical developments with explicit sections
    const devSectionMap = [
        { key: 'GitHub Updates', match: /github/i },
        { key: 'Technical Developments', match: /technical|tech/i }
    ];
    devSectionMap.forEach(section => {
        const cat = categoriesArray.find(c => section.match.test(c.title));
        if (cat) {
            const cards = (cat.content || []).map(item => createNewspaperCard({
                title: item.title || item.development || extractItemText(item),
                category: section.key,
                content: item.significance || item.summary || extractItemText(item),
                author: item.author,
                number: item.number,
                status: item.status,
                url: item.url,
                type: 'development'
            }));
            carousel.appendChild(createSubCarousel(section.key, cards));
        }
    });
}

/**
 * Populate community column with Discord updates, user feedback, and market analysis
 */
function populateCommunityColumn(categoriesArray) {
    const carousel = document.getElementById('community-news-carousel');
    if (!carousel) return;

    const communitySectionOrder = [
        { key: 'Twitter News Highlights', match: /twitter\s+news\s+highlights/i, titleBuilder: (it) => it.title || it.claim || 'Update' },
        { key: 'Discord Updates', match: /discord/i, titleBuilder: (it) => `#${String(it.channel || '').replace('#','')}` },
        { key: 'User Feedback', match: /feedback/i, titleBuilder: () => 'User Feedback' },
        { key: 'Market Analysis', match: /market/i, titleBuilder: () => 'Market Update' }
    ];

    communitySectionOrder.forEach(section => {
        const cat = categoriesArray.find(c => section.match.test(c.title));
        if (cat) {
            const cards = (cat.content || []).map(item => createNewspaperCard({
                title: section.titleBuilder(item) || item.title || 'Update',
                category: section.key,
                content: item.summary || item.feedback_summary || item.observation || extractItemText(item),
                participants: item.key_participants,
                sentiment: item.sentiment,
                relevance: item.relevance,
                type: 'community'
            }));
            carousel.appendChild(createSubCarousel(section.key, cards, true));
        }
    });
}

/**
 * Create a newspaper card element
 */
function createNewspaperCard(data) {
    const card = document.createElement('div');
    card.className = `newspaper-card ${data.featured ? 'featured' : ''} ${data.sentiment === 'negative' ? 'urgent' : ''} ${data.sentiment === 'positive' ? 'success' : ''}`;
    card.dataset.category = (data.category || '').toLowerCase();
    card.dataset.text = (data.title || '') + ' ' + (data.content || '');
    
    // Curate checkbox overlay
    const curate = document.createElement('div');
    curate.className = 'curate-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.title = 'Curate this item';
    input.addEventListener('change', (e) => {
        handleCurateToggle(e.target.checked, data);
    });
    const lbl = document.createElement('label');
    lbl.textContent = 'Curate';
    curate.appendChild(input);
    curate.appendChild(lbl);
    card.appendChild(curate);

    const header = document.createElement('div');
    header.className = 'newspaper-card-header';
    
    const category = document.createElement('span');
    category.className = 'newspaper-card-category';
    category.textContent = data.category;
    
    const sentiment = document.createElement('div');
    sentiment.className = `newspaper-card-sentiment ${data.sentiment || 'neutral'}`;
    
    header.appendChild(category);
    header.appendChild(sentiment);
    
    const title = document.createElement('div');
    title.className = 'newspaper-card-title';
    title.textContent = data.title;
    
    const content = document.createElement('div');
    content.className = 'newspaper-card-content';
    content.textContent = data.content;
    
    const meta = document.createElement('div');
    meta.className = 'newspaper-card-meta';
    
    if (data.author) {
        const author = document.createElement('span');
        author.className = 'newspaper-card-author';
        author.textContent = data.author;
        meta.appendChild(author);
    }
    
    if (data.number) {
        const number = document.createElement('span');
        number.className = 'newspaper-card-number';
        number.textContent = `#${data.number}`;
        meta.appendChild(number);
    }
    
    if (data.participants) {
        const participants = document.createElement('span');
        participants.className = 'newspaper-card-participants';
        participants.textContent = `${data.participants.length} participants`;
        meta.appendChild(participants);
    }
    
    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(meta);
    
    // Add click handler for more details
    card.addEventListener('click', () => {
        openCardDetailModal(data);
    });
    
    return card;
}

/**
 * Show detailed view of a card
 */
function openCardDetailModal(data) {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', () => {
        document.body.classList.remove('modal-open');
        backdrop.remove();
        modal.remove();
    });

    const modal = document.createElement('div');
    modal.className = 'card-detail-modal';

    const header = document.createElement('div');
    header.className = 'card-detail-header';
    const title = document.createElement('h3');
    title.className = 'card-detail-title';
    title.textContent = data.title || 'Details';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
        document.body.classList.remove('modal-open');
        backdrop.remove();
        modal.remove();
    });
    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'card-detail-body';

    // Build content grid
    const grid = document.createElement('div');
    grid.className = 'card-detail-grid';

    // Description
    grid.appendChild(renderDetailSection('Description', data.content || data.summary || data.insight || data.observation || '')); 

    // Meta
    const metaItems = [];
    if (data.category) metaItems.push(`<strong>Category:</strong> ${data.category}`);
    if (data.sentiment) metaItems.push(`<strong>Sentiment:</strong> ${data.sentiment}`);
    if (data.author) metaItems.push(`<strong>Author:</strong> ${data.author}`);
    if (data.number) metaItems.push(`<strong>#:</strong> ${data.number}`);
    if (data.status) metaItems.push(`<strong>Status:</strong> ${data.status}`);
    if (data.relevance) metaItems.push(`<strong>Relevance:</strong> ${data.relevance}`);
    if (data.participants) metaItems.push(`<strong>Participants:</strong> ${data.participants.join(', ')}`);
    grid.appendChild(renderDetailSection('Meta', metaItems.length ? metaItems.join('<br/>') : '—'));

    // Implications / questions
    if (data.implications) {
        grid.appendChild(renderDetailSection('Implications', `<ul>${data.implications.map(i => `<li>${i}</li>`).join('')}</ul>`));
    }

    // Links
    if (data.url || data.source || data.sources) {
        const links = [];
        if (data.url) links.push(`<a href="${data.url}" target="_blank">Primary Link</a>`);
        const srcArr = data.source || data.sources || [];
        srcArr.forEach((s, idx) => links.push(`<a href="${s}" target="_blank">Source ${idx + 1}</a>`));
        grid.appendChild(renderDetailSection('Links', links.join('<br/>')));
    }

    body.appendChild(grid);

    const footer = document.createElement('div');
    footer.className = 'card-detail-footer';
    const close2 = document.createElement('button');
    close2.textContent = 'Close';
    close2.className = 'modal-close-btn';
    close2.addEventListener('click', () => {
        document.body.classList.remove('modal-open');
        backdrop.remove();
        modal.remove();
    });
    footer.appendChild(close2);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
}

function renderDetailSection(title, innerHtml) {
    const section = document.createElement('div');
    section.className = 'card-detail-section';
    const h = document.createElement('h4');
    h.textContent = title;
    section.appendChild(h);
    const div = document.createElement('div');
    div.innerHTML = innerHtml || '—';
    section.appendChild(div);
    return section;
}

// Curate checkbox integration
function handleCurateToggle(checked, item) {
    // Normalize item shape minimally
    const toStore = { ...item };
    if (checked) {
        const result = addCuratedItem(curatedItems, toStore);
        if (result.success) {
            curatedItems = result.items;
            updateCuratedItemsDisplay();
            showToast('Added to curated');
        } else {
            showToast(result.message, true);
        }
    } else {
        // Remove first matching item by title/text
        const idx = curatedItems.findIndex(ci => (ci.title || ci.claim) === (item.title || item.claim));
        if (idx >= 0) {
            curatedItems.splice(idx, 1);
            updateCuratedItemsDisplay();
            showToast('Removed from curated');
        }
    }
}

/**
 * Initialize carousel navigation
 */
function initializeCarouselNavigation() {
    const carousels = [
        { id: 'main-news-carousel', prev: 'main-news-prev', next: 'main-news-next', horizontal: true },
        { id: 'dev-news-carousel', prev: 'dev-news-prev', next: 'dev-news-next', horizontal: true },
        { id: 'community-news-carousel', prev: 'community-news-prev', next: 'community-news-next', horizontal: false }
    ];
    
    carousels.forEach(carousel => {
        const track = document.getElementById(carousel.id);
        const prevBtn = document.getElementById(carousel.prev);
        const nextBtn = document.getElementById(carousel.next);
        const container = track ? track.parentElement : null;
        
        if (!track || !prevBtn || !nextBtn || !container) return;
        
        let currentIndex = 0;
        const items = track.children;
        const itemWidth = 340; // cards + margins
        const itemsPerRow = carousel.horizontal ? Math.max(1, Math.floor(track.parentElement.clientWidth / itemWidth)) : 1;
        const rowHeight = 220; // approximate height for one row
        const totalSteps = carousel.horizontal
            ? Math.max(0, Math.ceil(items.length / itemsPerRow) - 1)
            : Math.max(0, items.length - 1);
        
        function updateCarousel() {
            const transform = carousel.horizontal 
                ? `translateX(-${currentIndex * itemsPerRow * itemWidth}px)`
                : `translateY(-${currentIndex * rowHeight}px)`;
            track.style.transform = transform;
            
            prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
            nextBtn.style.display = currentIndex >= totalSteps ? 'none' : 'flex';
        }
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < totalSteps) {
                currentIndex++;
                updateCarousel();
            }
        });
        
        // Wheel pagination (scroll to paginate). For horizontal tracks, only intercept horizontal intent
        let lastWheelAt = 0;
        container.addEventListener('wheel', (e) => {
            const now = Date.now();
            if (now - lastWheelAt < 120) return; // throttle
            let handled = false;
            if (carousel.horizontal) {
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    handled = true;
                    lastWheelAt = now;
                    const delta = e.deltaX;
                    if (delta > 0 && currentIndex < totalSteps) { currentIndex++; updateCarousel(); }
                    if (delta < 0 && currentIndex > 0) { currentIndex--; updateCarousel(); }
                }
            } else {
                handled = true;
                lastWheelAt = now;
                const delta = e.deltaY;
                if (delta > 0 && currentIndex < totalSteps) { currentIndex++; updateCarousel(); }
                if (delta < 0 && currentIndex > 0) { currentIndex--; updateCarousel(); }
            }
            if (handled) e.preventDefault();
        }, { passive: false });

        // Touch swipe pagination
        let startX = 0, startY = 0;
        container.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX; startY = t.clientY;
        }, { passive: true });
        container.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            const primary = carousel.horizontal ? dx : dy;
            if (Math.abs(primary) > 40) {
                if (primary < 0 && currentIndex < totalSteps) {
                    currentIndex++;
                    updateCarousel();
                } else if (primary > 0 && currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            }
        }, { passive: true });
        
        // Recompute on resize for responsive rows
        window.addEventListener('resize', () => {
            currentIndex = Math.min(currentIndex, totalSteps);
            updateCarousel();
        });

        updateCarousel();
    });
} 

/**
 * Layout toggle between Newspaper and Masonry
 */
function toggleLayoutMode() {
    const newspaper = document.querySelector('.newspaper-layout');
    const masonry = document.getElementById('masonry-layout');
    if (!newspaper || !masonry) return;
    const showingMasonry = masonry.style.display !== 'none';
    masonry.style.display = showingMasonry ? 'none' : 'block';
    newspaper.style.display = showingMasonry ? 'grid' : 'none';
}

// Helper: section divider chip
function createSectionDivider(text) {
    const div = document.createElement('div');
    div.className = 'section-divider';
    div.textContent = text;
    return div;
}

// Helper: create a sub-carousel row inside a column
function createSubCarousel(title, cardElements, isVertical = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sub-carousel';

    const label = document.createElement('div');
    label.className = 'sub-title';
    label.textContent = title;
    wrapper.appendChild(label);

    const container = document.createElement('div');
    container.className = 'sub-container';
    const track = document.createElement('div');
    track.className = 'sub-track';
    // If too many items, hint scrolling instead of forcing pagination-only
    container.style.overflow = 'hidden';
    cardElements.forEach(el => track.appendChild(el));
    container.appendChild(track);

    const prev = document.createElement('button');
    prev.className = 'sub-nav sub-prev';
    prev.textContent = '‹';
    const next = document.createElement('button');
    next.className = 'sub-nav sub-next';
    next.textContent = '›';
    container.appendChild(prev);
    container.appendChild(next);

    // Pagination logic per sub-row
    let index = 0;
    const cardWidth = 320;
    const perRow = Math.max(1, Math.floor(container.clientWidth / cardWidth));
    const steps = Math.max(0, Math.ceil(cardElements.length / perRow) - 1);

    function update() {
        track.style.transform = `translateX(-${index * perRow * cardWidth}px)`;
        prev.style.display = index === 0 ? 'none' : 'flex';
        next.style.display = index >= steps ? 'none' : 'flex';
    }

    prev.addEventListener('click', () => { if (index > 0) { index--; update(); } });
    next.addEventListener('click', () => { if (index < steps) { index++; update(); } });

    // Wheel/Swipe
    let lastWheel = 0;
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheel < 120) return; lastWheel = now;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta > 0 && index < steps) { index++; update(); }
        if (delta < 0 && index > 0) { index--; update(); }
    }, { passive: false });

    let sx = 0; 
    container.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) { if (dx < 0 && index < steps) { index++; } else if (dx > 0 && index > 0) { index--; } update(); }
    }, { passive: true });

    // Resize
    window.addEventListener('resize', update);
    update();

    wrapper.appendChild(container);
    return wrapper;
}

/**
 * Populate Masonry layout with normalized data
 */
function populateMasonryLayout(jsonData) {
    const container = document.getElementById('masonry-layout');
    if (!container || !jsonData) return;
    container.innerHTML = '';

    const converted = convertJsonFormat(jsonData);
    const categoriesArray = Array.isArray(converted?.categories) ? converted.categories : [];

    categoriesArray.forEach(cat => {
        (cat.content || []).forEach(item => {
            const card = createMasonryCard(item, cat.title);
            container.appendChild(card);
        });
    });
}

function createMasonryCard(item, categoryTitle) {
    const card = document.createElement('div');
    card.className = 'masonry-card';
    card.dataset.category = (categoryTitle || '').toLowerCase();

    const header = document.createElement('div');
    header.className = 'masonry-card-header';
    const category = document.createElement('span');
    category.className = 'masonry-card-category';
    category.textContent = categoryTitle;
    const sentiment = document.createElement('span');
    sentiment.className = 'newspaper-card-sentiment ' + (item.sentiment || 'neutral');
    header.appendChild(category);
    header.appendChild(sentiment);

    const imageWrap = document.createElement('div');
    imageWrap.className = 'masonry-card-image';
    const img = document.createElement('img');
    img.src = getImageUrl(item);
    img.alt = 'News image';
    img.onerror = () => { img.src = 'images/nothumb.png'; };
    imageWrap.appendChild(img);

    const content = document.createElement('div');
    content.className = 'masonry-card-content';
    const title = document.createElement('div');
    title.className = 'masonry-card-title';
    title.textContent = item.title || item.claim || item.development || 'Update';
    const body = document.createElement('div');
    body.className = 'masonry-card-text';
    body.textContent = extractItemText(item);
    content.appendChild(title);
    content.appendChild(body);

    const meta = document.createElement('div');
    meta.className = 'masonry-card-meta';
    if (item.url) {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.textContent = 'Open';
        link.style.color = '#3391ff';
        meta.appendChild(link);
    } else {
        const span = document.createElement('span');
        span.textContent = 'No link';
        meta.appendChild(span);
    }
    const date = document.createElement('span');
    date.textContent = new Date().toLocaleDateString();
    meta.appendChild(date);

    card.appendChild(header);
    card.appendChild(imageWrap);
    card.appendChild(content);
    card.appendChild(meta);

    return card;
}