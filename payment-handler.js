// PayKeeper Payment Handler

class PaymentHandler {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api/paykeeper';
    }

    // Создать платеж для курса
    async createCoursePayment(course, userEmail, userPhone) {
        const orderId = `COURSE_${course.id}_${Date.now()}`;
        
        try {
            const response = await fetch(`${this.apiUrl}/create-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: course.price,
                    orderid: orderId,
                    clientid: userEmail,
                    service_name: `Курс: ${course.title}`,
                    client_email: userEmail,
                    client_phone: userPhone
                })
            });

            const data = await response.json();

            if (data.success) {
                // Перенаправляем на страницу оплаты
                window.location.href = data.payment_url;
            } else {
                throw new Error(data.error || 'Ошибка создания платежа');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при создании платежа. Попробуйте позже.');
        }
    }

    // Создать платеж для супервизии
    async createSupervisionPayment(supervision, userEmail, userPhone) {
        const orderId = `SUPERVISION_${supervision.id}_${Date.now()}`;
        
        try {
            const response = await fetch(`${this.apiUrl}/create-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: supervision.price,
                    orderid: orderId,
                    clientid: userEmail,
                    service_name: `Супервизия: ${supervision.title}`,
                    client_email: userEmail,
                    client_phone: userPhone
                })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = data.payment_url;
            } else {
                throw new Error(data.error || 'Ошибка создания платежа');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при создании платежа. Попробуйте позже.');
        }
    }

    // Показать форму для ввода контактов перед оплатой
    showPaymentForm(item, type = 'course') {
        const popup = document.createElement('div');
        popup.className = 'consultation-popup active';
        popup.id = 'paymentFormPopup';
        popup.innerHTML = `
            <div class="consultation-popup-overlay"></div>
            <div class="consultation-popup-content">
                <button class="consultation-popup-close">&times;</button>
                <h2 class="consultation-popup-title">Оплата</h2>
                <p class="consultation-popup-subtitle">${item.title}</p>
                <p class="consultation-popup-price">${item.price.toLocaleString('ru-RU')} ₽</p>
                
                <form class="consultation-form" id="paymentContactForm">
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email *" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" name="phone" placeholder="Телефон *" required>
                    </div>
                    <button type="submit" class="cta-button">Перейти к оплате</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(popup);
        document.body.style.overflow = 'hidden';
        
        // Close handlers
        const closeBtn = popup.querySelector('.consultation-popup-close');
        const overlay = popup.querySelector('.consultation-popup-overlay');
        
        const closeForm = () => {
            popup.remove();
            document.body.style.overflow = '';
        };
        
        closeBtn.addEventListener('click', closeForm);
        overlay.addEventListener('click', closeForm);
        
        // Form submit
        const form = document.getElementById('paymentContactForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const phone = formData.get('phone');
            
            closeForm();
            
            if (type === 'course') {
                await this.createCoursePayment(item, email, phone);
            } else if (type === 'supervision') {
                await this.createSupervisionPayment(item, email, phone);
            }
        });
    }

    // Проверить статус платежа
    async checkPaymentStatus(orderId) {
        try {
            const response = await fetch(`${this.apiUrl}/status/${orderId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            return null;
        }
    }
}

// Создаем глобальный экземпляр
window.paymentHandler = new PaymentHandler();
