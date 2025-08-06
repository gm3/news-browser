/**
 * News service for fetching and processing news data
 */

import { convertJsonFormat } from '../utils/dataUtils.js';
import { formatDate, parseBriefingDate } from '../utils/dateUtils.js';

/**
 * Fetch news data from URL
 * @param {string} url - URL to fetch from
 * @returns {Promise<Object>} Promise resolving to JSON data
 */
export async function fetchNewsData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

/**
 * Process news data and extract display information
 * @param {Object} jsonData - Raw JSON data
 * @returns {Object} Processed data with display information
 */
export function processNewsData(jsonData) {
    const convertedData = convertJsonFormat(jsonData);
    
    let displayDate = "";
    let lastUpdated = "";
    
    if (jsonData.briefing_date) {
        // Handle new date format (YYYY-MM-DD)
        const timestamp = parseBriefingDate(jsonData.briefing_date);
        if (timestamp) {
            displayDate = formatDate(timestamp);
        } else {
            displayDate = jsonData.briefing_date;
        }
        lastUpdated = new Date().toLocaleString();
    } else if (jsonData.date) {
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
    
    return {
        originalData: jsonData,
        convertedData,
        displayDate,
        lastUpdated
    };
}

/**
 * Load news from URL with full processing
 * @param {string} url - URL to fetch from
 * @returns {Promise<Object>} Promise resolving to processed news data
 */
export async function loadNews(url) {
    const jsonData = await fetchNewsData(url);
    return processNewsData(jsonData);
} 