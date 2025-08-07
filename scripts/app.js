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
        const newsData = await loadNews(url);
        originalJsonData = newsData.originalData;
        
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
    card.draggable = true;
    
    const itemText = extractItemText(item);
    card.dataset.text = itemText.toLowerCase();
    
    const sourceLinks = getSourceLinks(item);
    const imageUrl = getImageUrl(item);

    card.innerHTML = `
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
    
    // Check if we're viewing daily.json (today's news)
    const isViewingDaily = !currentDate || currentDate === getCurrentDate();
    
    const displayText = isViewingDaily ? 'Today' : formatDateForDisplay(currentDate);
    
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
        // Check if we're currently viewing daily.json (today's news)
        const isViewingDaily = !currentDate || currentDate === getCurrentDate();
        
        if (isViewingDaily) {
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
    // Check if we're currently viewing daily.json (today's news)
    const isViewingDaily = !currentDate || currentDate === getCurrentDate();
    
    if (isViewingDaily) {
        // When viewing daily.json, go to the most recent historical date
        if (availableDates.length > 0) {
            const mostRecentDate = availableDates[0].date;
            navigateToDate(mostRecentDate, loadNewsFromUrl);
            currentDate = mostRecentDate;
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
            updateDateDisplay();
            updateDateNavigationButtons();
        }
    }
}

/**
 * Navigate to next date (newer date)
 */
function navigateToNextDate() {
    // Check if we're currently viewing daily.json (today's news)
    const isViewingDaily = !currentDate || currentDate === getCurrentDate();
    
    if (isViewingDaily) {
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
            updateDateDisplay();
            updateDateNavigationButtons();
        } else if (currentIndex === 0) {
            // If we're at the most recent historical date, go back to daily.json
            loadNewsFromUrl(); // Load daily.json
            currentDate = getCurrentDate(); // Set to today
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
    const curationPanel = document.getElementById('curation-panel');
    const chatbotPanel = document.getElementById('chatbot-panel');
    
    // Show the panel
    rightPanel.classList.add('open');
    mainContent.classList.add('panel-open');
    
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
    
    rightPanel.classList.remove('open');
    mainContent.classList.remove('panel-open');
    
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