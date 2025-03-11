// dragAndDrop.js - Handles drag and drop functionality
import { globalState } from './main.js';
import { showToast } from './utils.js';
import { updateCuratedItemsDisplay } from './curationManager.js';

/**
 * Initialize drag and drop functionality
 */
export function initializeDragAndDrop() {
    const dropZone = document.getElementById("drop-zone");
    
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');

        try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (!globalState.curatedItems.some(item => item.text === data.text)) {
                globalState.curatedItems.push(data);
                updateCuratedItemsDisplay();
                dropZone.classList.add('drop-feedback');
                setTimeout(() => dropZone.classList.remove('drop-feedback'), 300);
                showToast('Item added to curated list');
            } else {
                showToast('Item already in curated list', true);
            }
        } catch (error) {
            console.error('Error processing dropped item:', error);
            showToast('Error adding item', true);
        }
    });
}