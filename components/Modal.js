/**
 * Modal component for dialogs and JSON viewer
 */

import { createModal, removeElement, focusAndSelectInput } from '../utils/domUtils.js';
import { showToast } from './Toast.js';

/**
 * Show JSON viewer modal
 * @param {Object} jsonData - JSON data to display
 */
export function showJsonViewer(jsonData) {
    const modal = createModal();
    
    const header = document.createElement('div');
    header.className = 'json-viewer-header';
    
    const title = document.createElement('h3');
    title.style.margin = '0';
    title.textContent = 'JSON Viewer';
    
    const controls = document.createElement('div');
    controls.className = 'json-viewer-controls';
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy JSON';
    copyBtn.onclick = () => {
        const jsonString = JSON.stringify(jsonData, null, 2);
        navigator.clipboard.writeText(jsonString)
            .then(() => showToast('JSON copied to clipboard!'))
            .catch(err => showToast('Failed to copy JSON', true));
    };
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download JSON';
    downloadBtn.onclick = () => {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `json_data_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('JSON downloaded successfully!');
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    closeBtn.onclick = () => removeElement(modal);
    
    controls.appendChild(copyBtn);
    controls.appendChild(downloadBtn);
    controls.appendChild(closeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    const content = document.createElement('div');
    content.className = 'json-viewer-content';
    
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(jsonData, null, 2);
    
    content.appendChild(pre);
    modal.appendChild(header);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * Show URL prompt modal for custom feed loading
 * @param {string} defaultUrl - Default URL to show
 * @param {Function} onLoad - Callback function when load is clicked
 */
export function showUrlPrompt(defaultUrl, onLoad) {
    const modal = createModal('json-viewer-modal', '400px');
    
    modal.innerHTML = `
        <div class="json-viewer-header">
            <h3 style="margin: 0;">Load News Feed</h3>
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div style="padding: 15px;">
            <input type="text" id="url-input" value="${defaultUrl}" 
                   style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; 
                          background: #2d2d2d; color: #fff; border: 1px solid #444; border-radius: 4px;">
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="background-color: #6c757d;">Cancel</button>
                <button onclick="loadNewsFromInput(this.parentElement.parentElement.parentElement)">Load</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus the input field
    setTimeout(() => {
        const input = document.getElementById('url-input');
        focusAndSelectInput(input);
    }, 100);
    
    // Store the onLoad callback globally for the onclick handler
    window.loadNewsFromInput = (modalElement) => {
        const url = modalElement.querySelector('#url-input').value.trim();
        removeElement(modalElement);
        if (url && onLoad) {
            onLoad(url);
        }
    };
}

/**
 * Create modal styles
 */
export function createModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .json-viewer-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 8px;
            z-index: 1000;
            max-width: 90vw;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .json-viewer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #444;
            background: #1e1e1e;
        }
        
        .json-viewer-controls {
            display: flex;
            gap: 10px;
        }
        
        .json-viewer-controls button {
            padding: 5px 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .json-viewer-controls button:hover {
            background: #0056b3;
        }
        
        .modal-close {
            background: #dc3545 !important;
            font-size: 18px;
            padding: 5px 10px !important;
        }
        
        .json-viewer-content {
            flex: 1;
            overflow: auto;
            padding: 15px;
        }
        
        .json-viewer-content pre {
            margin: 0;
            color: #e6e6e6;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    `;
    document.head.appendChild(style);
} 