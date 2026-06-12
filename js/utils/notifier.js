const Notifier = {
    container: null,
    
    init() {
        this.container = document.getElementById('notification-area');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-area';
            document.body.appendChild(this.container);
        }
        console.log('[Notifier] Initialized');
    },
    
    /**
     * Show a notification
     * @param {object} options - Notification options
     * @param {string} options.title - Title text
     * @param {string} options.message - Message text
     * @param {string} [options.type] - Type ('info', 'success', 'warning', 'error')
     * @param {number} [options.duration] - Duration in ms (default: 5000)
     */
    show({ title, message, type = 'info', duration = 5000 }) {
        if (!this.container) this.init();
        
        const notif = document.createElement('div');
        notif.className = `notification notif-${type}`;
        
        notif.innerHTML = `
            <div class="notif-title">${title}</div>
            <div class="notif-msg">${message}</div>
        `;
        
        this.container.appendChild(notif);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notif.parentNode) {
                notif.style.opacity = '0';
                notif.style.transform = 'translateX(100%)';
                setTimeout(() => notif.remove(), 300);
            }
        }, duration);
        
        return notif;
    },
    
    /**
     * Hide all notifications
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
};

// Export globally
window.Notifier = Notifier;