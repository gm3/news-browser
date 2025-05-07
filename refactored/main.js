// main.js - Entry point for the application
import { initializeEventListeners } from './eventHandlers.js';
import { loadSavedItems, loadNews } from './dataManager.js';
import { initializeDragAndDrop } from './dragAndDrop.js';
import { initializeKeyboardShortcuts } from './keyboardShortcuts.js';

// Constants
export const CONFIG = {
    DEFAULT_URL: "https://elizaos.github.io/knowledge/ai-news/elizaos/json/daily.json",
    STORAGE_KEY: "ai_news_curated_items"
};

// Global state (can be accessed by importing from main.js)
export let globalState = {
    curatedItems: [],
    originalJsonData: null,
    currentCuratedJson: null,
    activeFilters: [],
    searchTerm: ""
};

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
    
    // Add CSS styles for elements not in the original CSS
    addDynamicStyles();
});

// Add dynamic styles
function addDynamicStyles() {
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
    `;
    document.head.appendChild(style);
}