// keyboardShortcuts.js - Handles keyboard shortcuts
import { 
    showUrlPrompt, 
    viewOriginalJson, 
    generateCuratedJson 
} from './dataManager.js';

/**
 * Initialize keyboard shortcuts
 */
export function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only process if not in an input field
        if (document.activeElement.tagName !== 'INPUT') {
            switch(e.key.toLowerCase()) {
                case 'l':
                    showUrlPrompt();
                    break;
                case 's':
                    document.getElementById('search-input').focus();
                    break;
                case 'v':
                    viewOriginalJson();
                    break;
                case 'g':
                    generateCuratedJson();
                    break;
                case '?':
                    toggleShortcutsPanel();
                    break;
            }
        }
    });
}

/**
 * Toggle keyboard shortcuts panel
 */
export function toggleShortcutsPanel() {
    const panel = document.querySelector('.shortcuts-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}