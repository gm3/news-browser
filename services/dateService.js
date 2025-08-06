/**
 * Date service for managing historical news dates
 */

/**
 * Fetch available dates from GitHub repository
 * @returns {Promise<Array>} Array of available dates
 */
export async function fetchAvailableDates() {
    try {
        // Fetch the GitHub API to get the contents of the facts directory
        const response = await fetch('https://api.github.com/repos/elizaOS/knowledge/contents/the-council/facts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const dates = [];
        
        // Filter for JSON files and extract dates
        data.forEach(item => {
            if (item.type === 'file' && item.name.endsWith('.json')) {
                // Extract date from filename (e.g., "2025-01-15.json" -> "2025-01-15")
                const dateMatch = item.name.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
                if (dateMatch) {
                    dates.push({
                        date: dateMatch[1],
                        filename: item.name,
                        url: `https://elizaos.github.io/knowledge/the-council/facts/${item.name}`
                    });
                }
            }
        });
        
        // Sort dates in descending order (most recent first)
        dates.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return dates;
    } catch (error) {
        console.error('Error fetching available dates:', error);
        return [];
    }
}

/**
 * Get the current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
export function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Format date for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Get the URL for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string} URL for the date
 */
export function getDateUrl(date) {
    return `https://elizaos.github.io/knowledge/the-council/facts/${date}.json`;
}

/**
 * Navigate to a specific date
 * @param {string} date - Date to navigate to
 * @param {Function} loadFunction - Function to call with the new URL
 */
export function navigateToDate(date, loadFunction) {
    const url = getDateUrl(date);
    loadFunction(url);
} 