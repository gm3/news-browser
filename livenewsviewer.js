document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('live-news-container');
    const DEFAULT_NEWS_URL = 'https://elizaos.github.io/knowledge/ai-news/elizaos/json/daily.json';
    const SLIDE_INTERVAL = 2000; // Changed from 5000ms to 2000ms for faster debugging
    const ANIMATION_DURATION = 500; // 0.5 seconds, should match CSS
    const DEBUG_DISABLE_FONT_ADJUST = false; // SET TO true TO TEST WITHOUT FONT ADJUSTMENT

    let allNewsCards = [];
    let currentSlideIndex = -1;
    let slideIntervalId = null;
    let isTransitioning = false; // Flag to prevent concurrent transitions
    console.log('LiveNewsViewer Initialized'); // Initial log

    // Function to create a news card element
    function createNewsCard(item) {
        const slide = document.createElement('div');
        slide.classList.add('news-card');

        const mediaPane = document.createElement('div');
        mediaPane.classList.add('media-pane');

        if (item.images && item.images.length > 0) {
            const img = document.createElement('img');
            img.src = item.images[0];
            img.alt = item.title || 'News image';
            img.onerror = () => { 
                img.style.display = 'none'; 
                // Optionally, add a placeholder text or icon in mediaPane
                const placeholder = document.createElement('p');
                placeholder.textContent = 'Image not available';
                mediaPane.appendChild(placeholder);
            };
            mediaPane.appendChild(img);
        } else {
            // Placeholder if no image
            const placeholder = document.createElement('p');
            placeholder.textContent = 'No media available';
            mediaPane.appendChild(placeholder);
        }

        const contentPane = document.createElement('div');
        contentPane.classList.add('content-pane');

        const titleElement = document.createElement('h2');
        titleElement.textContent = item.title || 'Untitled';
        contentPane.appendChild(titleElement);

        const textElement = document.createElement('p');
        textElement.textContent = item.text || 'No content available.';
        contentPane.appendChild(textElement);

        if (item.sources && item.sources.length > 0) {
            const sourceLinksContainer = document.createElement('div');
            sourceLinksContainer.classList.add('source-links');
            item.sources.forEach(sourceUrl => {
                const link = document.createElement('a');
                link.href = sourceUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = getHostName(sourceUrl) || 'Source';
                sourceLinksContainer.appendChild(link);
            });
            contentPane.appendChild(sourceLinksContainer);
        }

        slide.appendChild(mediaPane);
        slide.appendChild(contentPane);
        
        return slide;
    }

    // Helper to get hostname from URL for display
    function getHostName(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return '';
        }
    }

    function adjustContentFontSize(contentPane, textElement) {
        const MAX_FONT_SIZE_PX = 32; // Max desired font size in pixels
        const MIN_FONT_SIZE_PX = 14; // Min acceptable font size in pixels
        const FONT_STEP_PX = 1;      // How much to decrease font size by each step

        if (!contentPane || !textElement) return;

        // Reset font size to max to start calculations
        textElement.style.fontSize = `${MAX_FONT_SIZE_PX}px`;

        // Iteratively reduce font size if text overflows container height
        // We also need to consider that the container might have padding.
        // For an accurate height comparison, ensure box-sizing is border-box for textElement or adjust.
        // contentPane has overflow-y: auto, so scrollHeight will be reliable on textElement if it's the direct child that might scroll.
        // However, contentPane itself is the scrolling container.
        // We want to check if textElement.scrollHeight > contentPane.clientHeight
        
        let currentFontSize = MAX_FONT_SIZE_PX;
        // Ensure textElement is not display:none for scrollHeight to be calculated correctly
        // The slide itself will be made visible, so this should be fine.

        while (
            textElement.scrollHeight > contentPane.clientHeight &&
            currentFontSize > MIN_FONT_SIZE_PX
        ) {
            currentFontSize -= FONT_STEP_PX;
            textElement.style.fontSize = `${currentFontSize}px`;
            // Re-check scrollHeight with the new font size
        }
        // Final check: if it's still too small, set to min (though the loop condition handles this)
        if (textElement.scrollHeight > contentPane.clientHeight && currentFontSize <= MIN_FONT_SIZE_PX) {
             textElement.style.fontSize = `${MIN_FONT_SIZE_PX}px`;
        }
    }

    function showSlide(index) {
        if (index === currentSlideIndex || allNewsCards.length === 0 || isTransitioning) return;
        
        isTransitioning = true;

        const newSlide = allNewsCards[index];
        const oldSlide = allNewsCards[currentSlideIndex]; 

        if (newSlide) {
            newSlide.classList.remove('fade-out'); 
            newSlide.classList.add('fade-in');    
        }

        const finalizeNewSlide = () => {
            if (newSlide) {
                newSlide.classList.add('active-slide');
                const contentPane = newSlide.querySelector('.content-pane');
                const textElement = newSlide.querySelector('.content-pane p');
                if (contentPane && textElement) {
                    // Call adjustContentFontSize after the slide is visible and has dimensions
                    adjustContentFontSize(contentPane, textElement);
                }
            }
            currentSlideIndex = index;
            isTransitioning = false;
        };

        if (oldSlide) {
            oldSlide.classList.remove('fade-in'); 
            oldSlide.classList.add('fade-out');   
            
            setTimeout(() => {
                oldSlide.classList.remove('active-slide');
                oldSlide.classList.remove('fade-out'); 
                finalizeNewSlide();
            }, ANIMATION_DURATION);
        } else {
            // First slide
            finalizeNewSlide();
            // Set timeout for isTransitioning based on first slide animation if needed, 
            // but finalizeNewSlide already sets isTransitioning to false. 
            // This might need a slight re-think if the first animation has issues.
            // For now, let's assume the fade-in class handles the first animation duration visually.
            // The isTransitioning flag should ideally be false only after the animation completes.
            // Let's adjust this for the first slide case more carefully.
             setTimeout(() => {
                // isTransitioning = false; // Already handled in finalizeNewSlide for the first slide after it is shown
                // However, the initial call to finalizeNewSlide for the first slide is immediate.
                // We need to ensure isTransitioning is true for ANIMATION_DURATION for the first slide too.
                // The current logic: finalizeNewSlide is called immediately, then sets isTransitioning to false.
                // This means the interval timer could start before the first animation is done.
                // Let's put isTransitioning = false for first slide into its own timeout.
                // No, finalizeNewSlide sets it. The issue is WHEN it's called for first slide.
            }, ANIMATION_DURATION); // This timeout is just for isTransitioning state for first slide
        }
    }

    // Minor correction for the first slide scenario in showSlide
    // The finalizeNewSlide for the first slide runs immediately, setting isTransitioning = false.
    // If the first slide has an animation (fade-in), isTransitioning should remain true during that period.
    // Revised structure for showSlide for clarity on first slide transition handling:

    function revisedShowSlide(index) {
        console.log(`Attempting to show slide: ${index}, current: ${currentSlideIndex}, transitioning: ${isTransitioning}`);
        if (index === currentSlideIndex || allNewsCards.length === 0 || isTransitioning) {
            console.log('Show slide bailed out.');
            return;
        }
        isTransitioning = true;
        console.log(`Set isTransitioning = true (slide ${index})`);

        const newSlide = allNewsCards[index];
        const oldSlide = allNewsCards[currentSlideIndex];

        const activateAndAdjustNewSlide = () => {
            if (newSlide) {
                console.log(`Activating new slide: ${index}`);
                newSlide.classList.add('active-slide');
                const contentPane = newSlide.querySelector('.content-pane');
                const textElement = newSlide.querySelector('.content-pane p');
                if (contentPane && textElement && !DEBUG_DISABLE_FONT_ADJUST) { // Check the flag
                    console.log(`Adjusting font for slide: ${index}`);
                    console.time('adjustContentFontSizeTime'); // Start timer
                    adjustContentFontSize(contentPane, textElement);
                    console.timeEnd('adjustContentFontSizeTime'); // End timer and log duration
                }
            }
            currentSlideIndex = index;
            console.log(`Current slide is now: ${currentSlideIndex}`);
        };

        if (newSlide) {
            newSlide.classList.remove('fade-out');
            newSlide.classList.add('fade-in');
        }

        if (oldSlide) {
            console.log(`Fading out old slide: ${currentSlideIndex}`);
            oldSlide.classList.remove('fade-in');
            oldSlide.classList.add('fade-out');
            setTimeout(() => {
                console.log(`Old slide ${currentSlideIndex} fade out complete.`);
                oldSlide.classList.remove('active-slide');
                oldSlide.classList.remove('fade-out');
                activateAndAdjustNewSlide();
                isTransitioning = false; 
                console.log(`Set isTransitioning = false (after old slide ${currentSlideIndex} out, new slide ${index} in)`);
            }, ANIMATION_DURATION);
        } else {
            // First slide
            console.log('First slide scenario');
            activateAndAdjustNewSlide();
            setTimeout(() => {
                isTransitioning = false; 
                console.log(`Set isTransitioning = false (after first slide ${index} animation)`);
            }, ANIMATION_DURATION);
        }
    }

    function nextSlide() {
        console.log('nextSlide called');
        if (allNewsCards.length === 0) {
            console.log('nextSlide: no cards');
            return;
        }
        let nextIndex = (currentSlideIndex + 1) % allNewsCards.length;
        console.log(`nextSlide calculated index: ${nextIndex}`);
        revisedShowSlide(nextIndex);
    }

    // Function to load and display news with animation
    async function loadAndDisplayNews() {
        console.log('Loading and displaying news...');
        try {
            const response = await fetch(DEFAULT_NEWS_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            if (jsonData && jsonData.categories && Array.isArray(jsonData.categories)) {
                jsonData.categories.forEach(category => {
                    if (category.content && Array.isArray(category.content)) {
                        category.content.forEach(item => {
                            if (!item.title && category.title) {
                                item.title = `${category.title}: ${item.text.substring(0, 50)}...`;
                            } else if (!item.title) {
                                item.title = `${item.text.substring(0, 50)}...`;
                            }
                            const newsItemCard = createNewsCard(item);
                            newsContainer.appendChild(newsItemCard);
                            allNewsCards.push(newsItemCard);
                        });
                    }
                });

                console.log(`Created ${allNewsCards.length} news cards.`);
                if (allNewsCards.length > 0) {
                    revisedShowSlide(0); // Show the first slide immediately
                    if (allNewsCards.length > 1) { // Only start interval if there's more than one slide
                       console.log('Starting slide interval');
                       slideIntervalId = setInterval(nextSlide, SLIDE_INTERVAL + ANIMATION_DURATION); // Add animation duration to interval
                    } else {
                        console.log('Only one slide, not starting interval.');
                    }
                } else {
                    newsContainer.innerHTML = '<p>No news items to display.</p>';
                    console.log('No news items found after processing.');
                }

            } else {
                newsContainer.innerHTML = '<p>No news items to display or data format is incorrect.</p>';
                console.error('No categories found or jsonData.categories is not an array:', jsonData);
            }
        } catch (error) {
            console.error('Failed to load or display news:', error);
            newsContainer.innerHTML = `<p>Error loading news: ${error.message}. Please try refreshing.</p>`;
        }
    }

    loadAndDisplayNews();

    // Optional: Pause slideshow on hover, resume on mouseout
    newsContainer.addEventListener('mouseenter', () => {
        console.log('Mouse enter - clearing interval');
        if (slideIntervalId) {
            clearInterval(slideIntervalId);
            slideIntervalId = null; // Explicitly set to null after clearing
        }
    });

    newsContainer.addEventListener('mouseleave', () => {
        console.log(`Mouse leave - attempting to restart. slideIntervalId: ${slideIntervalId}, cards: ${allNewsCards.length}`);
        // Only restart if it was previously cleared by mouseenter (i.e., slideIntervalId is null)
        // and there is more than one slide to cycle through.
        if (allNewsCards.length > 1 && slideIntervalId === null) { 
             console.log('Interval restarting on mouse leave.');
             slideIntervalId = setInterval(nextSlide, SLIDE_INTERVAL + ANIMATION_DURATION);
        } else {
            if (slideIntervalId !== null) {
                console.log('Interval NOT restarted on mouse leave - interval already active or not cleared by mouseenter.');
            } else if (allNewsCards.length <= 1) {
                console.log('Interval NOT restarted on mouse leave - only one or zero slides.');
            }
        }
    });
}); 