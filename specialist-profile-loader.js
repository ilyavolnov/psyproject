// Specialist Profile Loader
class SpecialistProfile {
    constructor() {
        this.specialist = null;
        this.container = document.getElementById('profileContent');
        this.init();
    }

    async init() {
        const specialistId = this.getSpecialistId();
        if (specialistId) {
            await this.loadSpecialist(specialistId);
            this.render();
        } else {
            this.showError('Специалист не найден');
        }
    }

    getSpecialistId() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
    }

    async loadSpecialist(id) {
        try {
            const response = await fetch('specialists-data.json');
            const data = await response.json();
            this.specialist = data.specialists.find(s => s.id === id);
        } catch (error) {
            console.error('Error loading specialist:', error);
        }
    }

    getStatusBadge(status) {
        const badges = {
            'available': '<span class="status-badge status-available">Доступен для записи</span>',
            'full': '<span class="status-badge status-full">Полная запись</span>',
            'waiting': '<span class="status-badge status-waiting">Запись в лист ожидания</span>'
        };
        return badges[status] || '';
    }

    getButtonText(status) {
        const buttons = {
            'available': 'Записаться на консультацию',
            'full': 'Полная запись',
            'waiting': 'Записаться в лист ожидания'
        };
        return buttons[status] || 'Записаться';
    }

    render() {
        if (!this.specialist) {
            this.showError('Специалист не найден');
            return;
        }

        const spec = this.specialist;
        
        // Update breadcrumb
        const breadcrumbName = document.getElementById('breadcrumbName');
        if (breadcrumbName) {
            breadcrumbName.textContent = spec.name;
        }
        
        // Update page title
        document.title = `${spec.name} - Специалист - Маргарита Румянцева`;
        const specTags = spec.specializations.map(s => 
            `<span class="spec-tag">✦ ${s}</span>`
        ).join('');

        const statusBadge = this.getStatusBadge(spec.status);
        const buttonText = this.getButtonText(spec.status);
        const buttonDisabled = spec.status === 'full' ? 'disabled' : '';

        const education = spec.education ? 
            `<div class="profile-block">
                <h3 class="profile-block-title">Образование</h3>
                <ul class="profile-list">
                    ${spec.education.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>` : '';

        const approaches = spec.approaches ?
            `<div class="profile-block">
                <h3 class="profile-block-title">Подходы в работе</h3>
                <ul class="profile-list">
                    ${spec.approaches.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>` : '';

        const description = spec.description || 'Описание специалиста будет добавлено позже.';

        this.container.innerHTML = `
            <div class="profile-header">
                <div class="profile-photo">
                    <img src="${spec.photo}" alt="${spec.name}">
                    ${statusBadge}
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${spec.name}</h1>
                    <p class="profile-role">${spec.role}</p>
                    <div class="profile-specializations">
                        ${specTags}
                    </div>
                    <div class="profile-meta">
                        <div class="profile-meta-item">
                            <span class="meta-label">Опыт работы:</span>
                            <span class="meta-value">${spec.experience} лет</span>
                        </div>
                        <div class="profile-meta-item">
                            <span class="meta-label">Стоимость консультации:</span>
                            <span class="meta-value">${spec.price} ₽</span>
                        </div>
                    </div>
                    <button class="profile-cta-btn" ${buttonDisabled}>
                        <span>${buttonText}</span>
                    </button>
                </div>
            </div>

            <div class="profile-details">
                <div class="profile-block">
                    <h3 class="profile-block-title">О специалисте</h3>
                    <p class="profile-description">${description}</p>
                </div>

                ${education}
                ${approaches}

                <div class="profile-block payment-block">
                    <h3 class="profile-block-title">Схема оплаты</h3>
                    <div class="payment-info">
                        <p>На номер в WhatsApp <strong>8 921 188 07 55</strong> вы отправляете скрин оплаты (или электронный чек) и указываете имя специалиста</p>
                        <p>После вы определяете время консультации совместно с терапевтом.</p>
                        <p>Оплата последующих сессий проводится <strong>ЗА СУТКИ</strong> до запланированной встречи по указанным выше реквизитам. По каждому переводу скидывается скрин (или электронный чек) в WhatsApp</p>
                        <div class="payment-rules">
                            <p><strong>Правила отмены:</strong></p>
                            <ul>
                                <li>В случае отмены консультации более, чем за 2 часа, денежные средства остаются на счету с возможностью оплаты следующей сессии (без штрафных санкций).</li>
                                <li>При отмене консультации менее, чем за 2 часа, денежные средства не компенсируются. (Исключение – обстоятельства непреодолимой силы.)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>${message}</h2>
                <a href="specialists.html" class="specialist-btn specialist-btn-primary">Вернуться к списку</a>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profileContent')) {
        new SpecialistProfile();
    }
});
