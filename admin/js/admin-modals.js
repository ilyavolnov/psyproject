// Custom Modal System for Admin Panel
// Replaces browser's alert() and confirm() with custom styled modals

class AdminModal {
    constructor() {
        this.createModalContainer();
    }

    createModalContainer() {
        // Remove existing modal if any
        const existing = document.getElementById('adminModalContainer');
        if (existing) {
            existing.remove();
        }

        // Create modal container
        const container = document.createElement('div');
        container.id = 'adminModalContainer';
        container.className = 'admin-modal-overlay';
        container.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-icon" id="adminModalIcon"></div>
                <h3 class="admin-modal-title" id="adminModalTitle"></h3>
                <p class="admin-modal-message" id="adminModalMessage"></p>
                <div class="admin-modal-buttons" id="adminModalButtons"></div>
            </div>
        `;
        document.body.appendChild(container);

        // Close on overlay click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                this.close();
            }
        });
    }

    show(options) {
        const {
            icon = 'ℹ️',
            title = 'Уведомление',
            message = '',
            buttons = []
        } = options;

        const container = document.getElementById('adminModalContainer');
        const iconEl = document.getElementById('adminModalIcon');
        const titleEl = document.getElementById('adminModalTitle');
        const messageEl = document.getElementById('adminModalMessage');
        const buttonsEl = document.getElementById('adminModalButtons');

        iconEl.textContent = icon;
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Clear and add buttons
        buttonsEl.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `admin-modal-btn ${btn.className || 'admin-modal-btn-primary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                this.close();
                if (btn.onClick) btn.onClick();
            };
            buttonsEl.appendChild(button);
        });

        container.classList.add('active');

        // Focus first button
        setTimeout(() => {
            const firstBtn = buttonsEl.querySelector('button');
            if (firstBtn) firstBtn.focus();
        }, 100);
    }

    close() {
        const container = document.getElementById('adminModalContainer');
        if (container) {
            container.classList.remove('active');
        }
    }

    // Alert replacement
    alert(message, title = 'Уведомление') {
        return new Promise((resolve) => {
            const icon = message.includes('✅') ? '✅' : 
                        message.includes('❌') ? '❌' : 
                        message.includes('⚠️') ? '⚠️' : 'ℹ️';
            
            this.show({
                icon,
                title,
                message: message.replace(/[✅❌⚠️]/g, '').trim(),
                buttons: [
                    {
                        text: 'OK',
                        className: 'admin-modal-btn-primary',
                        onClick: resolve
                    }
                ]
            });
        });
    }

    // Confirm replacement
    confirm(message, title = 'Подтверждение') {
        return new Promise((resolve) => {
            this.show({
                icon: '❓',
                title,
                message,
                buttons: [
                    {
                        text: 'Отмена',
                        className: 'admin-modal-btn-secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        text: 'Подтвердить',
                        className: 'admin-modal-btn-danger',
                        onClick: () => resolve(true)
                    }
                ]
            });
        });
    }

    // Success message
    success(message, title = 'Успешно') {
        return this.alert(message, title);
    }

    // Error message
    error(message, title = 'Ошибка') {
        return this.alert(message, title);
    }

    // Warning message
    warning(message, title = 'Внимание') {
        return this.alert(message, title);
    }
}

// Create global instance
const adminModal = new AdminModal();

// Override global alert and confirm
window.adminAlert = (message, title) => adminModal.alert(message, title);
window.adminConfirm = (message, title) => adminModal.confirm(message, title);
window.adminSuccess = (message, title) => adminModal.success(message, title);
window.adminError = (message, title) => adminModal.error(message, title);
window.adminWarning = (message, title) => adminModal.warning(message, title);

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = adminModal;
}
