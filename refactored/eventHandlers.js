// eventHandlers.js - Handles event listeners setup
import { 
    showUrlPrompt, 
    viewOriginalJson, 
    generateCuratedJson,
    clearCuratedItems,
    saveItems
} from './dataManager.js';
import { performSearch } from './filterManager.js';
import { toggleShortcutsPanel } from './keyboardShortcuts.js';

/**
 * Initialize all event listeners
 */
export function initializeEventListeners() {
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