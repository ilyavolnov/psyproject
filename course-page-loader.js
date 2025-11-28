// Course Page Loader - Renders course blocks from API

// Get course slug or ID from URL
const urlParams = new URLSearchParams(window.location.search);
const courseSlug = urlParams.get('slug');
const courseId = urlParams.get('id');

if (!courseSlug && !courseId) {
    document.getElementById('course-content').innerHTML = `
        <div class="error-state">
            <h2>Курс не найден</h2>
            <p>Пожалуйста, вернитесь на <a href="index.html#courses">главную страницу</a></p>
        </div>
    `;
} else {
    loadCourse(courseSlug || courseId);
}

// Load course data
async function loadCourse(identifier) {
    try {
        // Try to load by slug first, then by ID
        const response = await fetch(`http://localhost:3001/api/courses/slug/${identifier}`);
        const data = await response.json();
        
        // If slug not found, try by ID
        if (!data.success && !isNaN(identifier)) {
            const idResponse = await fetch(`http://localhost:3001/api/courses/${identifier}`);
            const idData = await idResponse.json();
            
            if (idData.success && idData.data) {
                const course = idData.data;
                document.title = `${course.title} - Маргарита Румянцева`;
                const blocks = JSON.parse(course.page_blocks || '[]');
                renderCourse(course, blocks);
                return;
            }
        }

        if (data.success && data.data) {
            const course = data.data;
            
            // Update page title
            document.title = `${course.title} - Маргарита Румянцева`;
            
            // Parse and render blocks
            const blocks = JSON.parse(course.page_blocks || '[]');
            renderCourse(course, blocks);
        } else {
            showError('Курс не найден');
        }
    } catch (error) {
        console.error('Error loading course:', error);
        showError('Ошибка загрузки курса');
    }
}

// Render course with blocks
function renderCourse(course, blocks) {
    const container = document.getElementById('course-content');
    
    if (blocks.length === 0) {
        // Fallback if no blocks
        container.innerHTML = `
            <div class="course-fallback">
                <div class="container">
                    <h1>${course.title}</h1>
                    <p>${course.description}</p>
                    <div class="course-info">
                        <span class="course-price">${course.price.toLocaleString('ru-RU')} ₽</span>
                        <button class="cta-button">Записаться на курс</button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Render blocks
    container.innerHTML = blocks.map(block => renderBlock(block, course)).join('');
}

// Render individual block
function renderBlock(block, course) {
    switch (block.type) {
        case 'hero':
            return renderHeroBlock(block.data, course);
        case 'description':
            return renderDescriptionBlock(block.data);
        case 'program':
            return renderProgramBlock(block.data);
        case 'features':
            return renderFeaturesBlock(block.data);
        case 'author':
            return renderAuthorBlock(block.data);
        default:
            return '';
    }
}

// Render Hero Block
function renderHeroBlock(data, course) {
    const hasCountdown = course.start_date && new Date(course.start_date) > new Date();
    
    return `
        <section class="course-hero">
            <div class="course-hero-bg">
                ${data.image ? `<img src="${data.image}" alt="${data.title}" class="course-hero-image">` : ''}
                <div class="course-hero-overlay"></div>
            </div>
            <div class="container">
                <div class="course-hero-content">
                    <h1 class="course-hero-title">${data.title}</h1>
                    
                    ${hasCountdown ? `
                        <div class="course-countdown" id="countdown-${course.id}" data-date="${course.start_date}">
                            <div class="countdown-item">
                                <span class="countdown-value" data-days>00</span>
                                <span class="countdown-label">дней</span>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-value" data-hours>00</span>
                                <span class="countdown-label">часов</span>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-value" data-minutes>00</span>
                                <span class="countdown-label">минут</span>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-value" data-seconds>00</span>
                                <span class="countdown-label">секунд</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="course-hero-info">
                        <span class="course-hero-price">${data.price.toLocaleString('ru-RU')} ₽</span>
                        ${data.startDate ? `<span class="course-hero-date">СТАРТ ${data.startDate}</span>` : ''}
                    </div>
                    <button class="course-hero-button" onclick="openPaymentInfo('${course.whatsapp_number}')">
                        Оплатить
                    </button>
                    ${data.paymentInstructions ? `
                        <div class="course-hero-instructions">
                            ${data.paymentInstructions.split('\n').map(line => `<p>${line}</p>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>
    `;
}

// Render Description Block
function renderDescriptionBlock(data) {
    return `
        <section class="course-description">
            <div class="container">
                <div class="course-description-grid">
                    ${data.image ? `
                        <div class="course-description-image">
                            <img src="${data.image}" alt="${data.title}">
                        </div>
                    ` : ''}
                    <div class="course-description-content">
                        <h2 class="course-description-title">${data.title}</h2>
                        ${data.subtitle ? `<p class="course-description-text">${data.subtitle}</p>` : ''}
                        ${data.contentType ? `<span class="course-description-type">${data.contentType}</span>` : ''}
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Render Program Block
function renderProgramBlock(data) {
    return `
        <section class="course-program">
            <div class="container">
                <h2 class="course-program-title">${data.title || 'Программа курса'}</h2>
                <div class="course-program-list">
                    ${data.items.map((item, index) => `
                        <div class="course-program-item">
                            <span class="course-program-number">${String(index + 1).padStart(2, '0')}</span>
                            <p class="course-program-text">${item}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

// Render Features Block
function renderFeaturesBlock(data) {
    const imagePosition = data.imagePosition || 'right';
    
    return `
        <section class="course-features">
            <div class="container">
                <div class="course-features-grid ${imagePosition === 'left' ? 'image-left' : 'image-right'}">
                    ${data.image ? `
                        <div class="course-features-image">
                            <img src="${data.image}" alt="${data.title}">
                        </div>
                    ` : ''}
                    <div class="course-features-content">
                        ${data.title ? `<h2 class="course-features-title">${data.title}</h2>` : ''}
                        <ul class="course-features-list">
                            ${data.items.map(item => `
                                <li class="course-features-item">
                                    <span class="course-features-icon">✓</span>
                                    <p>${item}</p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Render Author Block
function renderAuthorBlock(data) {
    return `
        <section class="course-author">
            <div class="container">
                <h2 class="course-author-heading">Автор и ведущая</h2>
                <div class="course-author-grid">
                    ${data.photo ? `
                        <div class="course-author-photo">
                            <img src="${data.photo}" alt="${data.name}">
                        </div>
                    ` : ''}
                    <div class="course-author-content">
                        <h3 class="course-author-name">${data.name}</h3>
                        <ul class="course-author-credentials">
                            ${data.credentials.map(credential => `
                                <li class="course-author-credential">${credential}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Show error
function showError(message) {
    document.getElementById('course-content').innerHTML = `
        <div class="error-state">
            <div class="container">
                <h2>Ошибка</h2>
                <p>${message}</p>
                <a href="index.html#courses" class="cta-button">Вернуться к курсам</a>
            </div>
        </div>
    `;
}

// Open payment info
window.openPaymentInfo = function(whatsapp) {
    if (whatsapp) {
        const phone = whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
    } else {
        alert('Для оплаты свяжитесь с нами через форму консультации');
    }
};


// Initialize countdowns after rendering
function initCountdowns() {
    document.querySelectorAll('[id^="countdown-"]').forEach(countdown => {
        const targetDate = new Date(countdown.dataset.date).getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                countdown.innerHTML = '<p class="countdown-ended">Курс начался!</p>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const daysEl = countdown.querySelector('[data-days]');
            const hoursEl = countdown.querySelector('[data-hours]');
            const minutesEl = countdown.querySelector('[data-minutes]');
            const secondsEl = countdown.querySelector('[data-seconds]');
            
            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
}

// Call after rendering
setTimeout(initCountdowns, 100);
