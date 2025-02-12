// Keep existing constants and helper functions
const DEFAULT_URL = "https://raw.githubusercontent.com/bozp-pzob/ai-news/refs/heads/main/json/daily.json";
let curatedItems = [];
let originalJsonData = null;
let currentCuratedJson = null;

function formatDate(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showJsonViewer(jsonData) {
    const modal = document.createElement('div');
    modal.className = 'json-viewer-modal';
    
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
            .then(() => alert('JSON copied to clipboard!'))
            .catch(err => alert('Failed to copy JSON: ' + err));
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
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    closeBtn.onclick = () => modal.remove();
    
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

function generateCuratedJson() {
    if (!originalJsonData || curatedItems.length === 0) {
        alert('No items curated yet!');
        return;
    }

    // Create new JSON structure maintaining original categories
    const curatedJson = {
        date: originalJsonData.date,
        categories: []
    };

    // Group curated items by their original categories
    const itemsByCategory = {};
    curatedItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
            itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
    });

    // Create categories array with curated content
    Object.keys(itemsByCategory).forEach(categoryTitle => {
        curatedJson.categories.push({
            title: categoryTitle,
            content: itemsByCategory[categoryTitle]
        });
    });

    currentCuratedJson = curatedJson;
    showJsonViewer(curatedJson);
}

function showUrlPrompt() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        z-index: 1000;
        min-width: 300px;
    `;
    
    modal.innerHTML = `
        <h3 style="margin-top: 0;">Load News Feed</h3>
        <input type="text" id="url-input" value="${DEFAULT_URL}" style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box;">
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
            <button onclick="this.parentElement.parentElement.remove()">Cancel</button>
            <button onclick="loadNewsFromInput(this.parentElement.parentElement)">Load</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function loadNewsFromInput(modal) {
    const url = modal.querySelector('#url-input').value.trim();
    modal.remove();
    if (url) {
        loadNews(url);
    }
}

function loadNews(url = DEFAULT_URL) {
    document.getElementById('load-news-btn').disabled = true;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsonData => {
            originalJsonData = jsonData;
            const feedContainer = document.getElementById("feed-container");
            feedContainer.innerHTML = "";
            
            if (jsonData.date) {
                const dateHeader = document.createElement("h3");
                dateHeader.className = "date-header";
                dateHeader.textContent = formatDate(jsonData.date);
                feedContainer.appendChild(dateHeader);
            }

            // Group content by categories
            jsonData.categories.forEach((category) => {
                const categorySection = document.createElement("div");
                categorySection.classList.add("category-section");
                
                const categoryTitle = document.createElement("h2");
                categoryTitle.classList.add("category-title");
                categoryTitle.textContent = category.title;
                categorySection.appendChild(categoryTitle);

                category.content.forEach((item) => {
                    item.category = category.title;
                    
                    let card = document.createElement("div");
                    card.classList.add("card");
                    card.draggable = true;
                    
                    const sourceLinks = item.sources.map(source => 
                        `<a href="${source}" target="_blank">${source}</a>`
                    ).join('<br>');

                    card.innerHTML = `
                        <div class="card-image">
                            <img src="${item.images.length ? item.images[0] : 'images/nothumb.png'}" alt="News thumbnail" />
                        </div>
                        <div class="card-content">
                            <p>${item.text}</p>
                            <div class="source-links">
                                ${sourceLinks}
                            </div>
                        </div>
                    `;

                    card.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", JSON.stringify(item));
                        card.classList.add("dragging");
                    });

                    card.addEventListener("dragend", () => {
                        card.classList.remove("dragging");
                    });

                    categorySection.appendChild(card);
                });

                feedContainer.appendChild(categorySection);
            });
        })
        .catch(error => {
            console.error("Error fetching news:", error);
            alert('Error loading news. Please try again.');
        })
        .finally(() => {
            document.getElementById('load-news-btn').disabled = false;
        });
}

// Drag and drop functionality
function initializeDragAndDrop() {
    const dropZone = document.getElementById("drop-zone");
    const activeFeed = document.getElementById("active-feed");

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
            if (!curatedItems.some(item => item.text === data.text)) {
                curatedItems.push(data);
                updateCuratedItemsDisplay();
                dropZone.classList.add('drop-feedback');
                setTimeout(() => dropZone.classList.remove('drop-feedback'), 300);
            }
        } catch (error) {
            console.error('Error processing dropped item:', error);
        }
    });
}

function updateCuratedItemsDisplay() {
    const container = document.querySelector('.curated-items');
    container.innerHTML = "";
    
    curatedItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'curated-item';
        itemElement.innerHTML = `
            <img src="${item.images.length ? item.images[0] : 'images/nothumb.png'}" alt="Thumbnail" />
            <p>${item.text.substring(0, 50)}...</p>
            <button onclick="removeItem(${index})" class="remove-btn">×</button>
        `;
        container.appendChild(itemElement);
    });
}

function removeItem(index) {
    curatedItems.splice(index, 1);
    updateCuratedItemsDisplay();
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
    initializeDragAndDrop();
    document.getElementById('load-news-btn').addEventListener('click', showUrlPrompt);
    document.getElementById('view-original-json-btn').addEventListener('click', () => {
        if (originalJsonData) {
            showJsonViewer(originalJsonData);
        } else {
            alert('No news loaded yet!');
        }
    });
    document.getElementById('generate-json-btn').addEventListener('click', generateCuratedJson);
    
    // Load news automatically
    loadNews();
});