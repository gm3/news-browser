/**
 * ReactBits UI enhancements for News Browser
 * Provides modern UI components and interactions
 */

/**
 * Create a modern card component with ReactBits styling
 * @param {Object} item - News item data
 * @param {string} categoryTitle - Category title
 * @returns {HTMLElement} Enhanced card element
 */
export function createModernCard(item, categoryTitle) {
    const card = document.createElement('div');
    card.className = 'modern-card';
    card.draggable = true;
    
    const itemText = extractItemText(item);
    card.dataset.text = itemText.toLowerCase();
    
    const sourceLinks = getSourceLinks(item);
    const imageUrl = getImageUrl(item);

    card.innerHTML = `
        <div class="card-header">
            <div class="card-category">${categoryTitle}</div>
            <div class="card-actions">
                <button class="action-btn" onclick="toggleCardDetails(this)" title="Toggle details">
                    <span class="icon">📋</span>
                </button>
            </div>
        </div>
        <div class="card-image">
            <img src="${imageUrl}" alt="News thumbnail" onerror="this.src='images/nothumb.png';" />
        </div>
        <div class="card-content">
            <p class="card-text">${itemText || "No content available"}</p>
            <div class="card-details" style="display: none;">
                <div class="source-links">
                    ${sourceLinks}
                </div>
                <div class="card-meta">
                    <span class="meta-item">📅 ${new Date().toLocaleDateString()}</span>
                    <span class="meta-item">🏷️ ${categoryTitle}</span>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <button class="curate-btn" onclick="addToCurated(this)" title="Add to curated">
                <span class="icon">⭐</span>
            </button>
        </div>
    `;

    card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(item));
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });

    return card;
}

/**
 * Create enhanced category section with ReactBits styling
 * @param {Object} category - Category data
 * @returns {HTMLElement} Enhanced category section
 */
export function createEnhancedCategorySection(category) {
    const categorySection = document.createElement("div");
    categorySection.classList.add("enhanced-category-section");
    categorySection.dataset.category = category.title;
    
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    
    const categoryTitle = document.createElement("h2");
    categoryTitle.classList.add("category-title");
    
    const itemCount = category.content ? category.content.length : 0;
    
    categoryTitle.innerHTML = `
        <span class="title-text">${category.title}</span>
        <span class="item-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
    `;
    
    const categoryActions = document.createElement("div");
    categoryActions.className = "category-actions";
    categoryActions.innerHTML = `
        <button class="action-btn" onclick="toggleCategory(this)" title="Toggle category">
            <span class="icon">📂</span>
        </button>
        <button class="action-btn" onclick="curateAllInCategory(this)" title="Curate all items">
            <span class="icon">⭐</span>
        </button>
    `;
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(categoryActions);
    categorySection.appendChild(categoryHeader);

    const categoryContent = document.createElement("div");
    categoryContent.className = "category-content";
    
    if (category.content && Array.isArray(category.content)) {
        category.content.forEach((item) => {
            const card = createModernCard(item, category.title);
            categoryContent.appendChild(card);
        });
    }
    
    categorySection.appendChild(categoryContent);
    return categorySection;
}

/**
 * Create modern loading indicator
 * @returns {HTMLElement} Enhanced loading indicator
 */
export function createModernLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'modern-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Loading news...</p>
        <div class="loading-progress">
            <div class="progress-bar"></div>
        </div>
    `;
    return loadingIndicator;
}

/**
 * Create enhanced toast notification
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 * @param {string} type - Toast type (success, error, info, warning)
 */
export function showEnhancedToast(message, isError = false, type = 'info') {
    const existingToast = document.querySelector('.enhanced-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `enhanced-toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Automatically remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Get appropriate icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon emoji
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': 
        default: return 'ℹ️';
    }
}

/**
 * Create ReactBits styles
 */
export function createReactBitsStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Modern Card Styles */
        .modern-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 16px;
            margin: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .modern-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .card-category {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            color: white;
        }
        
        .action-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: white;
        }
        
        .action-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .card-image img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        
        .card-text {
            color: white;
            margin: 0 0 12px 0;
            line-height: 1.5;
        }
        
        .card-details {
            background: rgba(255, 255, 255, 0.1);
            padding: 12px;
            border-radius: 8px;
            margin-top: 12px;
        }
        
        .card-meta {
            display: flex;
            gap: 12px;
            margin-top: 8px;
        }
        
        .meta-item {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .card-footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 12px;
        }
        
        .curate-btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .curate-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        }
        
        /* Enhanced Category Section */
        .enhanced-category-section {
            margin: 24px 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }
        
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .category-title {
            color: white;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .title-text {
            font-size: 24px;
            font-weight: 600;
        }
        
        .item-count {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            color: white;
        }
        
        .category-actions {
            display: flex;
            gap: 8px;
        }
        
        .category-content {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
        }
        
        /* Modern Loading Indicator */
        .modern-loading-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: white;
        }
        
        .loading-spinner {
            position: relative;
            width: 60px;
            height: 60px;
            margin-bottom: 20px;
        }
        
        .spinner-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .spinner-ring:nth-child(2) {
            border-top-color: #764ba2;
            animation-delay: 0.2s;
        }
        
        .spinner-ring:nth-child(3) {
            border-top-color: #ff6b6b;
            animation-delay: 0.4s;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-text {
            margin: 0 0 16px 0;
            font-size: 18px;
        }
        
        .loading-progress {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            animation: progress 2s ease-in-out infinite;
        }
        
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        
        /* Enhanced Toast */
        .enhanced-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
        }
        
        .enhanced-toast.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .enhanced-toast.success {
            background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
        }
        
        .enhanced-toast.error {
            background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
        }
        
        .enhanced-toast.warning {
            background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
        }
        
        .toast-icon {
            font-size: 20px;
        }
        
        .toast-content {
            flex: 1;
        }
        
        .toast-message {
            margin: 0;
            font-size: 14px;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .toast-close:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
}

// Helper functions (imported from dataUtils)
function extractItemText(item) {
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

function getSourceLinks(item) {
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

function getImageUrl(item) {
    if (item.url) return item.url;
    if (item.images && item.images.length) return item.images[0];
    return 'images/nothumb.png';
} 