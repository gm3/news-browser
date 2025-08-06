/**
 * Storage service for localStorage operations
 */

const STORAGE_KEY = "ai_news_curated_items";

/**
 * Load saved items from localStorage
 * @returns {Array} Array of curated items
 */
export function loadSavedItems() {
    try {
        const savedItems = localStorage.getItem(STORAGE_KEY);
        if (savedItems) {
            return JSON.parse(savedItems);
        }
    } catch (error) {
        console.error('Error loading saved items:', error);
    }
    return [];
}

/**
 * Save curated items to localStorage
 * @param {Array} items - Array of curated items
 */
export function saveItems(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving items:', error);
        return false;
    }
}

/**
 * Clear all saved items
 */
export function clearSavedItems() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing saved items:', error);
        return false;
    }
}

/**
 * Check if item already exists in curated items
 * @param {Array} curatedItems - Array of curated items
 * @param {Object} newItem - New item to check
 * @returns {boolean} True if item exists
 */
export function itemExists(curatedItems, newItem) {
    return curatedItems.some(item => {
        const itemText = extractItemText(item);
        const newItemText = extractItemText(newItem);
        return itemText === newItemText;
    });
}

/**
 * Add item to curated items if it doesn't exist
 * @param {Array} curatedItems - Array of curated items
 * @param {Object} newItem - New item to add
 * @returns {Object} Result with success status and updated items
 */
export function addCuratedItem(curatedItems, newItem) {
    if (itemExists(curatedItems, newItem)) {
        return { success: false, items: curatedItems, message: 'Item already in curated list' };
    }
    
    const updatedItems = [...curatedItems, newItem];
    const saveSuccess = saveItems(updatedItems);
    
    return {
        success: true,
        items: updatedItems,
        message: saveSuccess ? 'Item added to curated list' : 'Item added but failed to save'
    };
}

/**
 * Remove item from curated items
 * @param {Array} curatedItems - Array of curated items
 * @param {number} index - Index of item to remove
 * @returns {Object} Result with success status and updated items
 */
export function removeCuratedItem(curatedItems, index) {
    if (index < 0 || index >= curatedItems.length) {
        return { success: false, items: curatedItems, message: 'Invalid index' };
    }
    
    const updatedItems = curatedItems.filter((_, i) => i !== index);
    const saveSuccess = saveItems(updatedItems);
    
    return {
        success: true,
        items: updatedItems,
        message: saveSuccess ? 'Item removed from curated list' : 'Item removed but failed to save'
    };
}

// Helper function for extracting item text
function extractItemText(item) {
    if (item.claim) return item.claim;
    if (item.title) return item.title;
    if (item.summary) return item.summary;
    if (item.text) return item.text;
    if (item.feedback_summary) return item.feedback_summary;
    if (item.insight) return item.insight;
    if (item.observation) return item.observation;
    if (item.event) return item.event;
    if (item.issue) return item.issue;
    return JSON.stringify(item);
} 