// Consultation Popup Manager
class ConsultationPopup {
    constructor() {
        this.popup = document.getElementById('consultationPopup');
        this.closeBtn = document.getElementById('closePopup');
        this.form = document.getElementById('consultationForm');
        
        if (this.popup) {
            this.init();
        }
    }

    init() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.close());
        
        // Close on overlay click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.close();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup.classList.contains('active')) {
                this.close();
            }
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Setup trigger buttons
        this.setupTriggers();
    }

    setupTriggers() {
        // Urgent consultation buttons
        document.querySelectorAll('.urgent-consultation-btn, .urgent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.open('urgent');
            });
        });
        
        // Family session buttons
        document.querySelectorAll('.banner-btn-primary').forEach(btn => {
            btn.addEventListener('click', () => {
                this.open('family');
            });
        });
        
        // Specialist booking buttons
        document.querySelectorAll('.specialist-btn-primary:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                this.open('specialist');
            });
        });
    }

    open(type = '') {
        this.popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Pre-select request type if provided
        if (type) {
            const select = document.getElementById('requestType');
            if (select) {
                select.value = type;
            }
        }
    }

    close() {
        this.popup.classList.remove('active');
        document.body.style.overflow = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Отправка...</span>';
            
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                request_type: formData.get('requestType'),
                message: formData.get('message')
            };
            
            // Send to backend
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001/api' 
                : '/api';
            
            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                alert('✅ Спасибо за заявку! Мы свяжемся с вами в ближайшее время.');
                
                // Reset form and close popup
                this.form.reset();
                this.close();
            } else {
                throw new Error(result.message || 'Ошибка при отправке заявки');
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('❌ Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ConsultationPopup();
});
