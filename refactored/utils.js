// utils.js - Utility functions

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
export function showToast(message, isError = false) {
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

/**
 * Format a UNIX timestamp into a user-friendly date
 * @param {number} unixTimestamp - UNIX timestamp
 * @returns {string} Formatted date string
 */
export function formatDate(unixTimestamp) {
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

/**
 * Extract date from title if needed
 * @param {string} title - Title text that might contain a date
 * @returns {number|null} UNIX timestamp or null if no date found
 */
export function extractDateFromTitle(title) {
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

/**
 * Format URL for display
 * @param {string} url - The URL to format
 * @returns {string} Shortened/formatted URL
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
 * Toggle visibility of source list
 * @param {string} id - ID of the source list element to toggle
 */
export function toggleSourceList(id) {
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

// Make toggleSourceList globally available since it's called from inline event handlers
window.toggleSourceList = toggleSourceList;