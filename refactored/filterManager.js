// filterManager.js - Handles filtering and searching functionality
import { globalState } from './main.js';

/**
 * Setup category filters based on loaded data
 * @param {Object} jsonData - JSON data containing categories
 */
export function setupCategoryFilters(jsonData) {
    if (!jsonData || !jsonData.categories) return;
    
    const filterContainer = document.getElementById('category-filter');
    filterContainer.innerHTML = '<button data-category="all" class="active">All</button>';
    
    globalState.activeFilters = ['all']; // Reset active filters
    
    jsonData.categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.textContent = category.title;
        filterBtn.dataset.category = category.title;
        
        filterBtn.addEventListener('click', () => {
            toggleCategoryFilter(filterBtn, category.title);
        });
        
        filterContainer.appendChild(filterBtn);
    });
    
    // Add event listener for "All" button
    filterContainer.querySelector('[data-category="all"]').addEventListener('click', () => {
        // Clear all filters and set only "all" active
        document.querySelectorAll('#category-filter button').forEach(btn => {
            btn.classList.remove('active');
        });
        filterContainer.querySelector('[data-category="all"]').classList.add('active');
        globalState.activeFilters = ['all'];
        applyFiltersAndSearch();
    });
}

/**
 * Toggle category filter selection
 * @param {HTMLElement} button - The button element being toggled
 * @param {string} category - Category name
 */
export function toggleCategoryFilter(button, category) {
    // Unselect "All" if it's active
    if (globalState.activeFilters.includes('all')) {
        document.querySelector('#category-filter [data-category="all"]').classList.remove('active');
        globalState.activeFilters = [];
    }
    
    // Toggle this category
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        globalState.activeFilters = globalState.activeFilters.filter(cat => cat !== category);
        
        // If no filters are active, reactivate "All"
        if (globalState.activeFilters.length === 0) {
            document.querySelector('#category-filter [data-category="all"]').classList.add('active');
            globalState.activeFilters = ['all'];
        }
    } else {
        button.classList.add('active');
        globalState.activeFilters.push(category);
    }
    
    applyFiltersAndSearch();
}

/**
 * Perform search
 */
export function performSearch() {
    globalState.searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    applyFiltersAndSearch();
}

/**
 * Apply both category filters and search term
 */
export function applyFiltersAndSearch() {
    const sections = document.querySelectorAll('.category-section');
    const showAll = globalState.activeFilters.includes('all');
    
    sections.forEach(section => {
        const categoryName = section.dataset.category;
        const shouldShowCategory = showAll || globalState.activeFilters.includes(categoryName);
        
        if (shouldShowCategory) {
            section.style.display = '';
            
            // Apply search filter within visible categories
            if (globalState.searchTerm) {
                const cards = section.querySelectorAll('.card');
                let visibleCards = 0;
                
                cards.forEach(card => {
                    const cardText = card.dataset.text;
                    const matchesSearch = cardText && cardText.includes(globalState.searchTerm.toLowerCase());
                    card.style.display = matchesSearch ? '' : 'none';
                    if (matchesSearch) visibleCards++;
                });
                
                // If no cards match search in this category, hide the category
                section.style.display = visibleCards > 0 ? '' : 'none';
            } else {
                // Show all cards if no search term
                section.querySelectorAll('.card').forEach(card => {
                    card.style.display = '';
                });
            }
        } else {
            section.style.display = 'none';
        }
    });
}