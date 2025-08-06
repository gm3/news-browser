/**
 * DOM utility functions for news browser
 */

/**
 * Safely add event listeners
 * @param {string} id - Element ID
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 */
export function safeAddEventListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
}

/**
 * Format URL for display
 * @param {string} url - URL to format
 * @returns {string} Formatted URL
 */
export function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname.substring(0, 15) + (urlObj.pathname.length > 15 ? '...' : '');
    } catch (e) {
        return url.substring(0, 30) + (url.length > 30 ? '...' : '');
    }
}

/**
 * Create a modal element
 * @param {string} className - CSS class name
 * @param {string} width - Modal width
 * @returns {HTMLElement} Modal element
 */
export function createModal(className = 'json-viewer-modal', width = null) {
    const modal = document.createElement('div');
    modal.className = className;
    if (width) {
        modal.style.width = width;
    }
    return modal;
}

/**
 * Remove element from DOM
 * @param {HTMLElement} element - Element to remove
 */
export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Focus and select input element
 * @param {HTMLElement} input - Input element
 */
export function focusAndSelectInput(input) {
    if (input) {
        input.focus();
        input.select();
    }
} 