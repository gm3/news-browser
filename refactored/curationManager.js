// curationManager.js - Manages curated items
import { globalState } from './main.js';
import { showToast } from './utils.js';

/**
 * Update the display of curated items
 */
export function updateCuratedItemsDisplay() {
    const container = document.querySelector('.curated-items');
    container.innerHTML = "";
    
    // Update the counter
    document.getElementById('curated-count').textContent = globalState.curatedItems.length;
    
    globalState.curatedItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'curated-item';
        
        // Default image if no images available
        const imageUrl = (item.images && item.images.length) ? 
            item.images[0] : 'images/nothumb.png';
            
        // Truncate text for display
        const displayText = item.text ? 
            (item.text.length > 50 ? item.text.substring(0, 50) + "..." : item.text) : 
            "No content";
        
        // Handle sources for curated items   
        let sourceInfo = '';
        if (item.sources && item.sources.length > 0) {
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
 * @param {number} index - Index of the item to remove
 */
export function removeItem(index) {
    globalState.curatedItems.splice(index, 1);
    updateCuratedItemsDisplay();
    showToast('Item removed from curated list');
}

// Make removeItem globally available since it's called from inline HTML
window.removeItem = removeItem;