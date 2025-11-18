// Admin Supervisions Management

window.loadSupervisions = async function() {
    try {
        const response = await fetch('http://localhost:3001/api/supervisions');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to load supervisions');
        }
        
        const supervisions = data.data;
        
        const content = `
            <div class="admin-page-header">
                <h2 class="admin-page-title">Супервизии</h2>
                <button class="admin-btn admin-btn-primary" onclick="openSupervisionPopup()">
                    ➕ Добавить супервизию
                </button>
            </div>
            
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Длительность</th>
                            <th>Опыт</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${supervisions.map(sup => `
                            <tr>
                                <td>${sup.id}</td>
                                <td>${sup.name}</td>
                                <td>${sup.title}</td>
                                <td>${sup.price.toLocaleString('ru-RU')} ₽</td>
                                <td>${sup.duration}</td>
                                <td>${sup.experience}</td>
                                <td><span class="admin-status-badge admin-status-${sup.status}">${sup.status === 'available' ? 'Доступна' : 'Недоступна'}</span></td>
                                <td>
                                    <div class="admin-actions">
                                        <button class="admin-action-btn admin-action-edit" onclick="openSupervisionPopup(${sup.id})">Редактировать</button>
                                        <button class="admin-action-btn admin-action-delete" onclick="deleteSupervision(${sup.id})">Удалить</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('content').innerHTML = content;
        
    } catch (error) {
        console.error('Error loading supervisions:', error);
        await adminError('Ошибка загрузки супервизий');
    }
};

window.openSupervisionPopup = async function(id = null) {
    let supervision = null;
    
    if (id) {
        try {
            const response = await fetch(`http://localhost:3001/api/supervisions/${id}`);
            const data = await response.json();
            if (data.success) {
                supervision = data.data;
            }
        } catch (error) {
            console.error('Error loading supervision:', error);
        }
    }
    
    const popup = document.createElement('div');
    popup.className = 'admin-popup active';
    popup.id = 'supervisionPopup';
    popup.innerHTML = `
        <div class="admin-popup-overlay"></div>
        <div class="admin-popup-content" style="max-width: 800px;">
            <button class="admin-popup-close" onclick="closeSupervisionPopup()">&times;</button>
            <h2 class="admin-popup-title">${supervision ? 'Редактировать супервизию' : 'Добавить супервизию'}</h2>
            
            <form id="supervisionForm" class="admin-form">
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Имя супервизора *</label>
                        <input type="text" class="admin-form-input" id="supervisionName" value="${supervision?.name || ''}" required>
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Опыт</label>
                        <input type="text" class="admin-form-input" id="supervisionExperience" value="${supervision?.experience || ''}" placeholder="10 лет">
                    </div>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Название супервизии *</label>
                    <input type="text" class="admin-form-input" id="supervisionTitle" value="${supervision?.title || ''}" required>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Цена (₽)</label>
                        <input type="number" class="admin-form-input" id="supervisionPrice" value="${supervision?.price || 0}">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Длительность</label>
                        <input type="text" class="admin-form-input" id="supervisionDuration" value="${supervision?.duration || ''}" placeholder="55 минут">
                    </div>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение (URL)</label>
                    <input type="text" class="admin-form-input" id="supervisionImage" value="${supervision?.image || ''}">
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Теги (по одному на строку)</label>
                    <textarea class="admin-form-input" id="supervisionTags" rows="3">${supervision?.tags?.join('\n') || ''}</textarea>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Описание (по одному абзацу на строку)</label>
                    <textarea class="admin-form-input" id="supervisionDescription" rows="4">${supervision?.description?.join('\n\n') || ''}</textarea>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Образование (по одному пункту на строку)</label>
                    <textarea class="admin-form-input" id="supervisionEducation" rows="6">${supervision?.education?.join('\n') || ''}</textarea>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Статус</label>
                    <select class="admin-form-input" id="supervisionStatus">
                        <option value="available" ${!supervision || supervision.status === 'available' ? 'selected' : ''}>Доступна</option>
                        <option value="unavailable" ${supervision?.status === 'unavailable' ? 'selected' : ''}>Недоступна</option>
                    </select>
                </div>
                
                <div class="admin-form-actions">
                    <button type="button" class="admin-btn admin-btn-secondary" onclick="closeSupervisionPopup()">Отмена</button>
                    <button type="submit" class="admin-btn admin-btn-primary">💾 ${supervision ? 'Сохранить' : 'Создать'}</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    document.getElementById('supervisionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSupervision(id);
    });
};

window.closeSupervisionPopup = function() {
    document.getElementById('supervisionPopup')?.remove();
};

window.saveSupervision = async function(id) {
    try {
        const data = {
            name: document.getElementById('supervisionName').value,
            title: document.getElementById('supervisionTitle').value,
            image: document.getElementById('supervisionImage').value,
            price: parseInt(document.getElementById('supervisionPrice').value) || 0,
            duration: document.getElementById('supervisionDuration').value,
            experience: document.getElementById('supervisionExperience').value,
            tags: document.getElementById('supervisionTags').value.split('\n').filter(t => t.trim()),
            description: document.getElementById('supervisionDescription').value.split('\n\n').filter(d => d.trim()),
            education: document.getElementById('supervisionEducation').value.split('\n').filter(e => e.trim()),
            status: document.getElementById('supervisionStatus').value
        };
        
        const url = id 
            ? `http://localhost:3001/api/supervisions/${id}`
            : 'http://localhost:3001/api/supervisions';
        
        const response = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await adminSuccess(id ? 'Супервизия обновлена!' : 'Супервизия создана!');
            closeSupervisionPopup();
            loadSupervisions();
        } else {
            await adminError(result.error || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('Error saving supervision:', error);
        await adminError('Ошибка сохранения супервизии');
    }
};

window.deleteSupervision = async function(id) {
    const confirmed = await adminConfirm('Удалить эту супервизию?');
    if (!confirmed) return;
    
    try {
        const response = await fetch(`http://localhost:3001/api/supervisions/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await adminSuccess('Супервизия удалена!');
            loadSupervisions();
        } else {
            await adminError(result.error || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Error deleting supervision:', error);
        await adminError('Ошибка удаления супервизии');
    }
};
