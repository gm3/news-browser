document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('live-news-container');
    const DEFAULT_NEWS_URL = 'https://elizaos.github.io/knowledge/ai-news/elizaos/json/daily.json';
    const SLIDE_INTERVAL = 5000; // User requested 5000ms
    const ANIMATION_DURATION = 500; 
    // const DEBUG_DISABLE_FONT_ADJUST = false; // Removed

    let allNewsCards = [];
    let currentSlideIndex = -1;
    let slideIntervalId = null;
    let isTransitioning = false; 
    console.log('LiveNewsViewer Initialized'); 

    // NEW FUNCTION: animateCountUp
    function animateCountUp(element, targetValue, duration = 1500) {
        if (!element) return;
        let startValue = 0;
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
                element.textContent = currentValue;
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = targetValue;
            }
        }
        requestAnimationFrame(updateCount);
    }

    // NEW FUNCTION: createGitHubStatsCard
    function createGitHubStatsCard(summaryItem, completedItemsData) {
        const slide = document.createElement('div');
        slide.classList.add('news-card', 'github-stats-card'); 

        const titleElement = document.createElement('h2');
        titleElement.textContent = summaryItem.title || "GitHub Activity"; 
        slide.appendChild(titleElement);

        const statsContainer = document.createElement('div');
        statsContainer.classList.add('stats-container');

        const text = summaryItem.text || "";
        let prsOpened = 0, prsMerged = 0, issuesOpened = 0, activeContributors = 0;

        const prsOpenedMatch = text.match(/(\d+)\s+new\s+pull\s+requests/i);
        if (prsOpenedMatch) prsOpened = parseInt(prsOpenedMatch[1], 10);

        const prsMergedMatch = text.match(/with\s+(\d+)\s+of\s+them\s+merged/i);
        if (prsMergedMatch) prsMerged = parseInt(prsMergedMatch[1], 10);
        
        const issuesOpenedMatch = text.match(/(\d+)\s+new\s+issues\s+were\s+created/i);
        if (issuesOpenedMatch) issuesOpened = parseInt(issuesOpenedMatch[1], 10);

        const activeContributorsMatch = text.match(/had\s+(\d+)\s+active\s+contributors/i);
        if (activeContributorsMatch) activeContributors = parseInt(activeContributorsMatch[1], 10);
        
        let totalCompletedItems = 0;
        if (completedItemsData && completedItemsData.content && Array.isArray(completedItemsData.content)) {
            const completedText = completedItemsData.content[0]?.text || "";
            const prMatches = completedText.match(/PR\s+#\d+/g);
            if (prMatches) totalCompletedItems = prMatches.length;
        }

        // --- PRs and Issues Activity Section (using Charts.css) ---
        const activitySection = document.createElement('div');
        activitySection.classList.add('stats-section', 'activity-timeline');
        const activityTitle = document.createElement('h3');
        activityTitle.textContent = 'PRs & Issues Activity';
        activitySection.appendChild(activityTitle);

        const activityData = [
            { label: 'PRs Opened', value: prsOpened, color: '#28a745' },      // Green
            { label: 'PRs Merged', value: prsMerged, color: '#6f42c1' },      // Purple
            { label: 'Issues Opened', value: issuesOpened, color: '#dc3545' } // Red
        ];

        const maxValue = Math.max(...activityData.map(d => d.value), 1); // Ensure maxValue is at least 1 to avoid division by zero

        const chartTable = document.createElement('table');
        chartTable.classList.add('charts-css', 'column', 'show-labels', 'show-data-on-hover');
        // chartTable.style.height = '150px'; // Optional: set a fixed height for the chart
        // chartTable.style.setProperty('--labels-align', 'center');

        const tableBody = document.createElement('tbody');
        const tr = document.createElement('tr');

        activityData.forEach(data => {
            const td = document.createElement('td');
            const size = data.value / maxValue;
            td.style.setProperty('--size', `calc(${size})`);
            td.style.setProperty('--color', data.color);
            
            const tooltipSpan = document.createElement('span');
            tooltipSpan.classList.add('data'); // For Charts.css hover effect
            tooltipSpan.textContent = data.value;

            const labelSpan = document.createElement('span');
            labelSpan.classList.add('label');
            labelSpan.textContent = data.label;

            const valueSpan = document.createElement('span');
            valueSpan.classList.add('stat-value');
            valueSpan.dataset.target = data.value;
            valueSpan.textContent = '0'; // Initial value for animation

            // For Charts.css, the content of <td> often includes the visual bar and labels.
            // Let's put the animated value inside the label or as part of the structure.
            // td.innerHTML = `\${data.label}<br><span class="stat-value" data-target="\${data.value}">0</span> <span class="tooltiptext">\${data.value}</span>`;
            // More structured approach:
            td.appendChild(tooltipSpan); // This is usually the bar itself if using <span> inside <td>
            // td.appendChild(labelSpan); // Charts.css uses <th> for labels usually, or specific classes
            // For simplicity, we'll put the animated number and label directly in <td>, 
            // but Charts.css might style this in specific ways. We might need to adjust based on rendering.

            const contentDiv = document.createElement('div');
            contentDiv.style.textAlign = 'center'; // Center the text under/over the bar
            contentDiv.appendChild(valueSpan);
            contentDiv.appendChild(document.createElement('br'));
            contentDiv.appendChild(labelSpan);

            td.appendChild(contentDiv);
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
        chartTable.appendChild(tableBody);
        activitySection.appendChild(chartTable);
        statsContainer.appendChild(activitySection);

        const contributorsSection = document.createElement('div');
        contributorsSection.classList.add('stats-section', 'top-contributors');
        const contributorsTitle = document.createElement('h3');
        contributorsTitle.textContent = 'Contributors';
        contributorsSection.appendChild(contributorsTitle);
        
        const activeContributorsEl = document.createElement('p');
        activeContributorsEl.innerHTML = `Active Contributors: <span class="stat-value" data-target="${activeContributors}">0</span>`;
        contributorsSection.appendChild(activeContributorsEl);
        statsContainer.appendChild(contributorsSection);

        const completedSection = document.createElement('div');
        completedSection.classList.add('stats-section', 'completed-items');
        const completedTitle = document.createElement('h3');
        completedTitle.textContent = 'Completed Items';
        completedSection.appendChild(completedTitle);

        const totalCompletedEl = document.createElement('p');
        totalCompletedEl.innerHTML = `Total Completed Tasks (from PRs): <span class="stat-value" data-target="${totalCompletedItems}">0</span>`;
        completedSection.appendChild(totalCompletedEl);
        statsContainer.appendChild(completedSection);
        
        slide.appendChild(statsContainer);
        return slide;
    }

    function createNewsCard(item, categoryTitle) {
        const slide = document.createElement('div');
        slide.classList.add('news-card');
        const mediaPane = document.createElement('div');
        mediaPane.classList.add('media-pane');

        if (item.images && item.images.length > 0) {
            const img = document.createElement('img');
            img.src = item.images[0];
            img.alt = item.title || categoryTitle || 'News image';
            img.onerror = () => { 
                img.style.display = 'none'; 
                const placeholder = document.createElement('p');
                placeholder.textContent = 'Image not available';
                mediaPane.appendChild(placeholder);
            };
            mediaPane.appendChild(img);
        } else {
            const placeholder = document.createElement('p');
            placeholder.textContent = 'No media available';
            mediaPane.appendChild(placeholder);
        }

        const contentPane = document.createElement('div');
        contentPane.classList.add('content-pane');

        const titleElement = document.createElement('h2');
        let actualTitle = item.title || categoryTitle || 'Untitled';
        
        const MAX_TITLE_LENGTH = 100; // Max length for display title
        const summaryMarker = "Summary:";
        const summaryIndex = actualTitle.indexOf(summaryMarker);

        if (summaryIndex !== -1) {
            actualTitle = actualTitle.substring(0, summaryIndex + summaryMarker.length);
        } else if (actualTitle.length > MAX_TITLE_LENGTH) {
            actualTitle = actualTitle.substring(0, MAX_TITLE_LENGTH) + '...';
        }

        titleElement.textContent = actualTitle;
        contentPane.appendChild(titleElement);

        const textElement = document.createElement('p');
        textElement.textContent = item.text || 'No content available.';
        contentPane.appendChild(textElement);

        slide.appendChild(mediaPane);
        slide.appendChild(contentPane);
        return slide;
    }

    function getHostName(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return '';
        }
    }

    function fitTextToContainer(containerElement, textElement, maxFontSize = 48, minFontSize = 12, isHorizontalFit = false) {
        if (!containerElement || !textElement) return;

        let currentFontSize = maxFontSize;
        textElement.style.fontSize = `${currentFontSize}px`;

        let checkOverflow;
        let targetDimensionForLog; // Use a more generic name for logging

        if (isHorizontalFit) {
            const BUFFER_PX = 2; // Reduced buffer from 5 to 2
            checkOverflow = () => textElement.scrollWidth > (containerElement.clientWidth - BUFFER_PX);
            targetDimensionForLog = containerElement.clientWidth - BUFFER_PX;
            // console.log(`Title Fit: Initial - Text: "${textElement.textContent.substring(0,30)}...", scrollW: ${textElement.scrollWidth}, containerClientW: ${containerElement.clientWidth}, TargetW: ${targetDimensionForLog}, Font: ${currentFontSize}px`);
        } else {
            checkOverflow = () => textElement.scrollHeight > containerElement.clientHeight;
            targetDimensionForLog = containerElement.clientHeight; // For vertical, target is clientHeight
            // Optional: Add initial log for vertical fit if desired
            // console.log(`Para Fit: Initial - Text: "${textElement.textContent.substring(0,30)}...", scrollH: ${textElement.scrollHeight}, containerClientH: ${targetDimensionForLog}, Font: ${currentFontSize}px`);
        }

        let iterations = 0;
        while (checkOverflow() && currentFontSize > minFontSize) {
            currentFontSize--;
            textElement.style.fontSize = `${currentFontSize}px`;
            iterations++;
            if (isHorizontalFit) {
                 // console.log(`Title Fit: Iteration ${iterations} - scrollW: ${textElement.scrollWidth}, TargetW: ${targetDimensionForLog}, New Font: ${currentFontSize}px`);
            } else {
                // Optional: Add iteration log for vertical fit
                // console.log(`Para Fit: Iteration ${iterations} - scrollH: ${textElement.scrollHeight}, TargetH: ${targetDimensionForLog}, New Font: ${currentFontSize}px`);
            }
        }
        if (isHorizontalFit) {
            // console.log(`Title Fit: Final - scrollW: ${textElement.scrollWidth}, TargetW: ${targetDimensionForLog}, Font: ${currentFontSize}px, Iterations: ${iterations}`);
        } else {
            // Optional: Add final log for vertical fit
            // console.log(`Para Fit: Final - scrollH: ${textElement.scrollHeight}, TargetH: ${targetDimensionForLog}, Font: ${currentFontSize}px, Iterations: ${iterations}`);
        }
        // Final check to ensure it doesn't go below minFontSize due to the loop condition
        if (checkOverflow() && currentFontSize <= minFontSize) {
            textElement.style.fontSize = `${minFontSize}px`;
        }
    }

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
                
                // Check if it's a GitHub stats card
                if (newSlide.classList.contains('github-stats-card')) {
                    console.log(`Activating GitHub Stats slide content: ${index}`);
                    const statValues = newSlide.querySelectorAll('.stat-value');
                    statValues.forEach(el => {
                        const target = parseInt(el.dataset.target, 10);
                        animateCountUp(el, target); // Animate numbers
                    });
                } else { // Regular news card content adjustment
                    const contentPane = newSlide.querySelector('.content-pane');
                    const titleElement = newSlide.querySelector('.content-pane h2');
                    const paragraphElement = newSlide.querySelector('.content-pane p');

                    if (contentPane && titleElement) {
                        console.log(`Adjusting title font for slide: ${index}`);
                        fitTextToContainer(titleElement, titleElement, 60, 24, true);
                    }
                    if (paragraphElement) {
                        console.log(`Adjusting paragraph font for slide: ${index}`);
                        fitTextToContainer(paragraphElement, paragraphElement, 48, 14, false);
                    }
                }
            }
            currentSlideIndex = index;
            console.log(`Current slide is now: ${currentSlideIndex}`);
        };

        if (newSlide) {
            // Reset font sizes for regular cards before animation
            if (!newSlide.classList.contains('github-stats-card')) {
                const titleElement = newSlide.querySelector('.content-pane h2');
                const paragraphElement = newSlide.querySelector('.content-pane p');
                if(titleElement) titleElement.style.fontSize = ''; 
                if(paragraphElement) paragraphElement.style.fontSize = ''; 
            }
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
                // Reset font sizes of old regular slide 
                if (!oldSlide.classList.contains('github-stats-card')) {
                    const oldTitle = oldSlide.querySelector('.content-pane h2');
                    const oldParagraph = oldSlide.querySelector('.content-pane p');
                    if(oldTitle) oldTitle.style.fontSize = '';
                    if(oldParagraph) oldParagraph.style.fontSize = '';
                }

                activateAndAdjustNewSlide();
                isTransitioning = false; 
                console.log(`Set isTransitioning = false (after old slide ${currentSlideIndex} out, new slide ${index} in)`);
            }, ANIMATION_DURATION);
        } else {
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

    async function loadAndDisplayNews() {
        console.log('Loading and displaying news...');
        try {
            const response = await fetch(DEFAULT_NEWS_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            let gitHubSummaryData = null;
            let completedItemsCategoryData = null;
            allNewsCards = []; // Clear existing cards before loading new ones
            newsContainer.innerHTML = ''; // Clear the container
            currentSlideIndex = -1; // Reset slide index
            if(slideIntervalId) clearInterval(slideIntervalId); // Clear existing interval

            if (jsonData && jsonData.categories && Array.isArray(jsonData.categories)) {
                jsonData.categories.forEach(category => {
                    if (category.topic === 'github_summary' && category.content && category.content.length > 0) {
                        gitHubSummaryData = category.content[0]; 
                        if (category.title && !gitHubSummaryData.title) gitHubSummaryData.title = category.title; 
                    }
                    if (category.topic === 'completed_items') {
                        completedItemsCategoryData = category;
                    }
                });

                if (gitHubSummaryData) {
                    const statsCard = createGitHubStatsCard(gitHubSummaryData, completedItemsCategoryData);
                    newsContainer.appendChild(statsCard);
                    allNewsCards.push(statsCard);
                    console.log('Created GitHub Stats card.');
                }

                jsonData.categories.forEach(category => {
                    if (category.topic === 'github_summary' || category.topic === 'completed_items') {
                        return; 
                    }
                    if (category.content && Array.isArray(category.content)) {
                        category.content.forEach(item => {
                            if (item === gitHubSummaryData && gitHubSummaryData !== null) return; 

                            const newsItemCard = createNewsCard(item, category.title);
                            newsContainer.appendChild(newsItemCard);
                            allNewsCards.push(newsItemCard);
                        });
                    }
                });

                console.log(`Total cards created (including stats): ${allNewsCards.length}`);
                if (allNewsCards.length > 0) {
                    revisedShowSlide(0); 
                    if (allNewsCards.length > 1) { 
                       console.log(`Starting slide interval. Expected delay: ${SLIDE_INTERVAL + ANIMATION_DURATION}ms`);
                       let intervalCount = 0;
                       slideIntervalId = setInterval(() => {
                           intervalCount++;
                           console.log(`setInterval TICK #${intervalCount} - Calling nextSlide. isTransitioning: ${isTransitioning}`);
                           nextSlide();
                       }, SLIDE_INTERVAL + ANIMATION_DURATION);
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
}); 