/**
 * Toast notification component
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
export function showToast(message, isError = false) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Automatically remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Create toast styles
 */
export function createToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            border-radius: 4px;
            z-index: 1000;
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .toast-notification.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .toast-notification.error {
            background-color: #dc3545;
        }
    `;
    document.head.appendChild(style);
} 