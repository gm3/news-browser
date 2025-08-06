/**
 * Data utility functions for news browser
 */

/**
 * Convert new JSON format to expected array format
 * @param {Object} jsonData - JSON data object
 * @returns {Object} Converted data object
 */
export function convertJsonFormat(jsonData) {
    if (!jsonData || !jsonData.categories) return jsonData;
    
    // If categories is already an array, return as is
    if (Array.isArray(jsonData.categories)) {
        return jsonData;
    }
    
    // Convert object format to array format
    const convertedData = { ...jsonData };
    convertedData.categories = [];
    
    Object.keys(jsonData.categories).forEach(categoryKey => {
        const categoryData = jsonData.categories[categoryKey];
        
        // Handle different category data structures
        if (Array.isArray(categoryData)) {
            // Convert array of items to category format
            convertedData.categories.push({
                title: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                content: categoryData,
                topic: categoryKey
            });
        } else if (typeof categoryData === 'object' && categoryData !== null) {
            // Handle nested objects (like github_updates)
            if (categoryData.new_issues_prs && Array.isArray(categoryData.new_issues_prs)) {
                convertedData.categories.push({
                    title: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    content: categoryData.new_issues_prs,
                    topic: categoryKey
                });
            } else if (categoryData.overall_focus && Array.isArray(categoryData.overall_focus)) {
                // Handle github_updates.overall_focus
                convertedData.categories.push({
                    title: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' - Focus',
                    content: categoryData.overall_focus,
                    topic: categoryKey
                });
            } else {
                // Convert object to single item
                convertedData.categories.push({
                    title: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    content: [categoryData],
                    topic: categoryKey
                });
            }
        }
    });
    
    return convertedData;
}

/**
 * Extract text content from item based on structure
 * @param {Object} item - Item object
 * @returns {string} Extracted text content
 */
export function extractItemText(item) {
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

/**
 * Get source links from item
 * @param {Object} item - Item object
 * @returns {string} HTML string for source links
 */
export function getSourceLinks(item) {
    let sourceLinks = '';
    
    if (item.source && Array.isArray(item.source)) {
        if (item.source.length === 1) {
            sourceLinks = `<a href="${item.source[0]}" target="_blank" class="source-link">${item.source[0]}</a>`;
        } else if (item.source.length > 1) {
            const toggleId = `sources-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            sourceLinks = `
                <div class="source-toggle">
                    <button class="source-toggle-btn" onclick="toggleSourceList('${toggleId}')">
                        ${item.source.length} Sources
                        <span class="toggle-icon">+</span>
                    </button>
                    <div id="${toggleId}" class="source-list">
                        ${item.source.map(source => 
                            `<a href="${source}" target="_blank">${source}</a>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    } else if (item.sources && Array.isArray(item.sources)) {
        if (item.sources.length === 1) {
            sourceLinks = `<a href="${item.sources[0]}" target="_blank" class="source-link">${item.sources[0]}</a>`;
        } else if (item.sources.length > 1) {
            const toggleId = `sources-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            sourceLinks = `
                <div class="source-toggle">
                    <button class="source-toggle-btn" onclick="toggleSourceList('${toggleId}')">
                        ${item.sources.length} Sources
                        <span class="toggle-icon">+</span>
                    </button>
                    <div id="${toggleId}" class="source-list">
                        ${item.sources.map(source => 
                            `<a href="${source}" target="_blank">${source}</a>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    return sourceLinks;
}

/**
 * Get image URL from item
 * @param {Object} item - Item object
 * @returns {string} Image URL
 */
export function getImageUrl(item) {
    if (item.url) return item.url;
    if (item.images && item.images.length) return item.images[0];
    return 'images/nothumb.png';
} 