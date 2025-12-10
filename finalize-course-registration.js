// Script to finalize course registration functionality

// Step 1: Update courses loader for homepage to use registration instead of payment
const fs = require('fs');
const path = require('path');

// Update the hero block renderer in courses-loader-homepage.js
const coursesLoaderPath = path.join(__dirname, 'includes', 'courses-loader-homepage.js');

try {
    let coursesLoaderContent = fs.readFileSync(coursesLoaderPath, 'utf8');
    
    // Update button text from "Оплатить" to "Записаться" and change function call
    coursesLoaderContent = coursesLoaderContent.replace(
        /onclick="openPaymentInfo\([^)]*\)"/g,
        'onclick="openCourseRegistration(\'$1\', \'$2\', \'$3\')"'
    ).replace(
        /Оплатить/g,
        'Записаться'
    );
    
    fs.writeFileSync(coursesLoaderPath, coursesLoaderContent);
    console.log('✅ Updated courses-loader-homepage.js with registration functionality');
} catch (error) {
    console.error('❌ Error updating courses-loader-homepage.js:', error);
}

// Step 2: Update script.js to include the openCourseRegistration function
const scriptPath = path.join(__dirname, 'script.js');
try {
    let scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Check if openCourseRegistration function already exists
    if (!scriptContent.includes('openCourseRegistration')) {
        // Append the function to the end of the script
        const newFunction = `
        
// Open course registration popup
window.openCourseRegistration = function(courseTitle, coursePrice, courseType) {
    // Determine if it's a webinar to customize the popup title
    const isWebinar = courseType && (courseType.toLowerCase().includes('webinar') || courseTitle.toLowerCase().includes('вебинар'));
    const popupType = isWebinar ? 'вебинар' : 'курс';
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'order-popup active';
    popup.id = 'courseRegistrationPopup';
    popup.innerHTML = \`
        <div class="order-popup-overlay" onclick="closeOrderPopup()"></div>
        <div class="order-popup-content">
            <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>

            <h2 class="order-popup-title">Заявка на \${popupType}</h2>
            <div class="order-popup-service">
                <span class="order-service-name">\${courseTitle}</span>
                <span class="order-service-price" id="orderPrice" data-price="\${coursePrice}">\${coursePrice.toLocaleString('ru-RU')} ₽</span>
            </div>

            <form id="courseRegistrationForm" class="order-form">
                <div class="order-form-group">
                    <label class="order-form-label">Ваше имя *</label>
                    <input type="text" class="order-form-input" id="orderName" name="name" required placeholder="Введите ваше имя">
                </div>

                <div class="order-form-group">
                    <label class="order-form-label">Номер телефона *</label>
                    <input type="tel" class="order-form-input" id="orderPhone" name="phone" required placeholder="+7 (___) ___-__-__">
                </div>

                <div class="order-form-group">
                    <label class="order-form-label">E-mail *</label>
                    <input type="email" class="order-form-input" id="orderEmail" name="email" required placeholder="example@mail.com">
                </div>

                <div class="order-form-group">
                    <label class="order-form-label">Комментарий (необязательно)</label>
                    <textarea class="order-form-input" id="orderMessage" name="message" rows="3" placeholder="Дополнительная информация">\${isWebinar ? 'Запись на вебинар' : 'Запись на курс'}</textarea>
                </div>

                <div class="order-promo-toggle">
                    <button type="button" class="order-promo-btn" onclick="togglePromoField()">
                        <span>🎁</span> Ввести промокод
                    </button>
                </div>

                <div class="order-promo-field" id="orderPromoField" style="display: none;">
                    <div class="order-form-group">
                        <label class="order-form-label">Промокод</label>
                        <div class="order-promo-input-wrapper">
                            <input type="text" class="order-form-input" id="orderPromo" name="promo" placeholder="Введите промокод">
                            <button type="button" class="order-promo-apply" onclick="applyPromo()">Применить</button>
                        </div>
                        <div class="order-promo-message" id="promoMessage"></div>
                    </div>
                </div>

                <div class="order-agreements">
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderPrivacy" required>
                        <span>Я ознакомлен(а) и согласен(а) с <a href="privacy-policy.html" target="_blank">Политикой конфиденциальности</a></span>
                    </label>
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderConsent" required>
                        <span>Я даю согласие на обработку моих персональных данных</span>
                    </label>
                </div>

                <button type="submit" class="order-submit-btn">
                    Отправить заявку на запись
                </button>
            </form>
        </div>
    \`;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Store course info for submission
    popup.dataset.courseName = courseTitle;
    popup.dataset.courseType = courseType;
    popup.dataset.coursePrice = coursePrice;

    // Handle form submission
    document.getElementById('courseRegistrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitCourseRegistration();
    });

    // Phone mask
    const phoneInput = document.getElementById('orderPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] !== '7') value = '7' + value;
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length >= 5) formatted += ') ' + value.substring(4, 7);
            if (value.length >= 8) formatted += '-' + value.substring(7, 9);
            if (value.length >= 10) formatted += '-' + value.substring(9, 11);
            e.target.value = formatted;
        }
    });
};

// Submit course registration
window.submitCourseRegistration = async function() {
    const popup = document.getElementById('courseRegistrationPopup');

    const orderData = {
        name: document.getElementById('orderName').value,
        phone: document.getElementById('orderPhone').value,
        email: document.getElementById('orderEmail').value,
        message: document.getElementById('orderMessage').value,
        request_type: 'course_registration', // Specific type for course registrations
        service_name: popup.dataset.courseName,
        service_type: popup.dataset.courseType,
        price: popup.dataset.coursePrice
    };

    try {
        // Show loading state
        const submitBtn = document.querySelector('.order-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        // Send to API
        const API_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:3001/api/requests'
            : '/api/requests';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showCourseRegistrationSuccess();
        } else {
            throw new Error(result.error || 'Ошибка отправки заявки');
        }
    } catch (error) {
        console.error('Error submitting course registration:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');

        // Restore button
        const submitBtn = document.querySelector('.order-submit-btn');
        submitBtn.textContent = 'Отправить заявку на запись';
        submitBtn.disabled = false;
    }
};

// Show success for course registration
function showCourseRegistrationSuccess() {
    const popup = document.getElementById('courseRegistrationPopup');
    const content = popup.querySelector('.order-popup-content');

    content.innerHTML = \`
        <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>
        <div class="order-success">
            <div class="order-success-icon">✓</div>
            <h2 class="order-success-title">Заявка отправлена!</h2>
            <p class="order-success-text">
                Спасибо за вашу заявку на запись. Мы свяжемся с вами в ближайшее время для подтверждения и уточнения деталей.
            </p>
            <button class="order-success-btn" onclick="closeOrderPopup()">Закрыть</button>
        </div>
    \`;
}

// Close course registration popup
window.closeOrderPopup = function() {
    const popup = document.getElementById('courseRegistrationPopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
};
        `;
        
        fs.writeFileSync(scriptPath, scriptContent);
        console.log('✅ Added openCourseRegistration function to script.js');
    }
} catch (error) {
    console.error('❌ Error updating script.js:', error);
}

console.log('🎉 Course registration functionality finalized!');