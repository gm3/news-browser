/**
 * Date utility functions for news browser
 */

/**
 * Format date with improved handling
 * @param {number} unixTimestamp - Unix timestamp
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
 * @param {string} title - Title string that may contain a date
 * @returns {number|null} Unix timestamp or null
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
 * Parse briefing date from new format
 * @param {string} briefingDate - Date in YYYY-MM-DD format
 * @returns {number} Unix timestamp
 */
export function parseBriefingDate(briefingDate) {
    const dateParts = briefingDate.split('-');
    if (dateParts.length === 3) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2]);
        const dateObj = new Date(year, month, day);
        return Math.floor(dateObj.getTime() / 1000);
    }
    return null;
} 