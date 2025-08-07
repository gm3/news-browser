/**
 * Calendar component for date selection
 */

/**
 * Create calendar styles
 */
export function createCalendarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .calendar-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            max-width: 400px;
            width: 90%;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            color: white;
        }

        .calendar-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
        }

        .calendar-nav-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }

        .calendar-nav-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            margin-bottom: 20px;
        }

        .calendar-day-header {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 600;
            padding: 8px;
            font-size: 0.9rem;
        }

        .calendar-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-weight: 500;
            position: relative;
        }

        .calendar-day:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        .calendar-day.available {
            background: rgba(76, 175, 80, 0.3);
            border: 2px solid rgba(76, 175, 80, 0.5);
        }

        .calendar-day.available:hover {
            background: rgba(76, 175, 80, 0.5);
            transform: scale(1.1);
        }

        .calendar-day.selected {
            background: rgba(255, 193, 7, 0.8);
            color: #333;
            font-weight: 700;
        }

        .calendar-day.other-month {
            opacity: 0.3;
        }

        .calendar-day.today {
            border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .calendar-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
        }

        .calendar-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .calendar-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .calendar-today-btn {
            background: rgba(76, 175, 80, 0.3);
            border: 1px solid rgba(76, 175, 80, 0.5);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            margin-right: 10px;
        }

        .calendar-today-btn:hover {
            background: rgba(76, 175, 80, 0.5);
            transform: scale(1.05);
        }

        .calendar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            backdrop-filter: blur(5px);
        }

        .calendar-loading {
            text-align: center;
            color: white;
            padding: 20px;
        }

        .calendar-loading .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Show calendar for date selection
 * @param {Array} availableDates - Array of available dates
 * @param {Function} onDateSelect - Callback when date is selected
 * @param {string} currentDate - Currently selected date
 */
export function showCalendar(availableDates, onDateSelect, currentDate = null) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'calendar-overlay';
    
    // Create calendar container
    const calendar = document.createElement('div');
    calendar.className = 'calendar-container';
    
    // Add loading state initially
    calendar.innerHTML = `
        <div class="calendar-loading">
            <div class="spinner"></div>
            <p>Loading calendar...</p>
        </div>
    `;
    
    overlay.appendChild(calendar);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    // Render calendar once dates are available
    renderCalendar(calendar, availableDates, onDateSelect, currentDate);
}

/**
 * Render the calendar
 * @param {HTMLElement} container - Calendar container
 * @param {Array} availableDates - Available dates
 * @param {Function} onDateSelect - Date selection callback
 * @param {string} currentDate - Current selected date
 */
function renderCalendar(container, availableDates, onDateSelect, currentDate) {
    const today = new Date();
    const currentMonth = new Date();
    let selectedDate = currentDate ? new Date(currentDate) : today;
    
    // Create available dates set for quick lookup
    // Handle both object format {date, filename, url} and string format
    const availableDatesSet = new Set(availableDates.map(d => typeof d === 'object' ? d.date : d));
    
    function renderMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        container.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" id="prev-month">&lt;</button>
                <h2 class="calendar-title">${monthNames[month]} ${year}</h2>
                <button class="calendar-nav-btn" id="next-month">&gt;</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
                ${days.map(day => {
                    // Format date as YYYY-MM-DD without timezone issues
                    const year = day.getFullYear();
                    const month = String(day.getMonth() + 1).padStart(2, '0');
                    const date = String(day.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${date}`;
                    
                    const isAvailable = availableDatesSet.has(dateStr);
                    const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0];
                    
                    // Format today's date for comparison
                    const todayDate = new Date();
                    const todayYear = todayDate.getFullYear();
                    const todayMonth = String(todayDate.getMonth() + 1).padStart(2, '0');
                    const todayDay = String(todayDate.getDate()).padStart(2, '0');
                    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
                    const isToday = dateStr === todayStr;
                    const isOtherMonth = day.getMonth() !== month;
                    
                    let className = 'calendar-day';
                    if (isOtherMonth) className += ' other-month';
                    if (isToday) className += ' today';
                    if (isAvailable) className += ' available';
                    if (isSelected) className += ' selected';
                    
                    return `<div class="${className}" data-date="${dateStr}">${day.getDate()}</div>`;
                }).join('')}
            </div>
            <div class="calendar-footer">
                <button class="calendar-today-btn" id="today-btn">Today</button>
                <button class="calendar-close-btn" id="close-calendar">Close</button>
                <span style="color: white; font-size: 0.9rem;">
                    ${availableDates.length} dates available
                </span>
            </div>
        `;
        
        // Add event listeners
        container.querySelector('#prev-month').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            renderMonth(currentMonth.getFullYear(), currentMonth.getMonth());
        });
        
        container.querySelector('#next-month').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            renderMonth(currentMonth.getFullYear(), currentMonth.getMonth());
        });
        
        container.querySelector('#close-calendar').addEventListener('click', () => {
            document.body.removeChild(container.parentElement);
        });
        
        container.querySelector('#today-btn').addEventListener('click', () => {
            // Format today's date as YYYY-MM-DD without timezone issues
            const todayDate = new Date();
            const year = todayDate.getFullYear();
            const month = String(todayDate.getMonth() + 1).padStart(2, '0');
            const date = String(todayDate.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${date}`;
            
            if (availableDatesSet.has(today)) {
                selectedDate = new Date(today);
                onDateSelect(today);
                document.body.removeChild(container.parentElement);
            }
        });
        
        // Add day click listeners
        container.querySelectorAll('.calendar-day').forEach(dayElement => {
            dayElement.addEventListener('click', () => {
                const date = dayElement.dataset.date;
                if (availableDatesSet.has(date)) {
                    selectedDate = new Date(date);
                    onDateSelect(date);
                    document.body.removeChild(container.parentElement);
                }
            });
        });
    }
    
    renderMonth(currentMonth.getFullYear(), currentMonth.getMonth());
} 