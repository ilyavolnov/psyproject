// Course Page Blocks System - Inline editing like specialists

// Block types for courses
const COURSE_BLOCK_TYPES = {
    hero: {
        name: 'Главный блок (Hero)',
        icon: '🎯'
    },
    description: {
        name: 'Описание',
        icon: '📝'
    },
    program: {
        name: 'Программа курса',
        icon: '📋'
    },
    features: {
        name: 'Преимущества',
        icon: '✨'
    },
    author: {
        name: 'Автор курса',
        icon: '👤'
    }
};

// Initialize course blocks
window.initCourseBlocks = function(existingBlocks = []) {
    window.currentCourseBlocks = existingBlocks.length > 0 ? existingBlocks : [];
    renderCourseBlocks();
};

// Generate block HTML for editing
function generateCourseBlockEditor(block, index) {
    const blockType = COURSE_BLOCK_TYPES[block.type] || { name: 'Неизвестный блок', icon: '📄' };
    
    return `
        <div class="admin-block-item" data-block-index="${index}" draggable="false">
            <div class="admin-block-header">
                <div class="admin-block-drag-handle" draggable="true" title="Перетащите для изменения порядка">⋮⋮</div>
                <span class="admin-block-icon">${blockType.icon}</span>
                <span class="admin-block-type-name">${blockType.name}</span>
                <div class="admin-block-actions">
                    <button type="button" class="admin-block-move-up-btn" onclick="moveCourseBlockUp(${index})" ${index === 0 ? 'disabled' : ''} title="Переместить вверх">
                        ↑
                    </button>
                    <button type="button" class="admin-block-move-down-btn" onclick="moveCourseBlockDown(${index})" title="Переместить вниз">
                        ↓
                    </button>
                    <button type="button" class="admin-block-toggle-btn" onclick="toggleCourseBlock(${index})" title="Свернуть/Развернуть">
                        <span class="toggle-icon">▼</span>
                    </button>
                    <button type="button" class="admin-block-delete-btn" onclick="deleteCourseBlock(${index})" title="Удалить блок">
                        ✕
                    </button>
                </div>
            </div>
            <div class="admin-block-body" id="courseBlockBody${index}">
                ${generateCourseBlockFields(block, index)}
            </div>
        </div>
    `;
}

// Generate fields based on block type
function generateCourseBlockFields(block, index) {
    const type = block.type;
    const data = block.data || {};
    
    switch(type) {
        case 'hero':
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение (URL)</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="image" 
                           value="${data.image || ''}" placeholder="https://...">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Название курса</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${data.title || ''}" placeholder="Название курса">
                </div>
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Цена (₽)</label>
                        <input type="number" class="admin-form-input course-block-field" 
                               data-block-index="${index}" data-field="price" 
                               value="${data.price || 0}">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Дата старта</label>
                        <input type="text" class="admin-form-input course-block-field" 
                               data-block-index="${index}" data-field="startDate" 
                               value="${data.startDate || ''}" placeholder="10 ноября">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Инструкция по оплате</label>
                    <textarea class="admin-form-input course-block-field" rows="3"
                              data-block-index="${index}" data-field="paymentInstructions"
                              placeholder="Инструкция по оплате">${data.paymentInstructions || ''}</textarea>
                </div>
            `;
            
        case 'description':
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение (URL)</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="image" 
                           value="${data.image || ''}" placeholder="https://...">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${data.title || ''}" placeholder="Заголовок">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Подзаголовок/Описание</label>
                    <textarea class="admin-form-input course-block-field" rows="3"
                              data-block-index="${index}" data-field="subtitle"
                              placeholder="Описание">${data.subtitle || ''}</textarea>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Тип контента</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="contentType" 
                           value="${data.contentType || ''}" placeholder="Лекция + презентация">
                </div>
            `;
            
        case 'program':
            const programItems = data.items || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок блока</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${data.title || 'Программа курса'}" placeholder="Заголовок">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Пункты программы (по одному на строку)</label>
                    <textarea class="admin-form-input course-block-field" rows="8"
                              data-block-index="${index}" data-field="items"
                              placeholder="Пункт 1\nПункт 2\nПункт 3">${programItems.map(item => typeof item === 'string' ? item : item.text).join('\n')}</textarea>
                </div>
            `;
            
        case 'features':
            const featureItems = data.items || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение (URL)</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="image" 
                           value="${data.image || ''}" placeholder="https://...">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Позиция изображения</label>
                    <select class="admin-form-input course-block-field" 
                            data-block-index="${index}" data-field="imagePosition">
                        <option value="left" ${data.imagePosition === 'left' ? 'selected' : ''}>Слева</option>
                        <option value="right" ${data.imagePosition === 'right' ? 'selected' : ''}>Справа</option>
                    </select>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${data.title || ''}" placeholder="Заголовок">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Преимущества (по одному на строку)</label>
                    <textarea class="admin-form-input course-block-field" rows="6"
                              data-block-index="${index}" data-field="items"
                              placeholder="Преимущество 1\nПреимущество 2">${featureItems.join('\n')}</textarea>
                </div>
            `;
            
        case 'author':
            const credentials = data.credentials || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Фото автора (URL)</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="photo" 
                           value="${data.photo || ''}" placeholder="https://...">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Имя автора</label>
                    <input type="text" class="admin-form-input course-block-field" 
                           data-block-index="${index}" data-field="name" 
                           value="${data.name || ''}" placeholder="Имя автора">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Регалии/Достижения (по одному на строку)</label>
                    <textarea class="admin-form-input course-block-field" rows="6"
                              data-block-index="${index}" data-field="credentials"
                              placeholder="Регалия 1\nРегалия 2">${credentials.join('\n')}</textarea>
                </div>
            `;
            
        default:
            return '<p>Неизвестный тип блока</p>';
    }
}

// Render all blocks
function renderCourseBlocks() {
    const container = document.getElementById('courseBlocksContainer');
    if (!container) return;
    
    const blocks = window.currentCourseBlocks || [];
    
    if (blocks.length === 0) {
        container.innerHTML = `
            <div class="admin-empty-state">
                <p>Блоки не добавлены. Выберите тип блока выше.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = blocks.map((block, index) => generateCourseBlockEditor(block, index)).join('');
    
    // Attach event listeners for field updates
    attachCourseBlockFieldListeners();
}

// Attach listeners to update blocks data
function attachCourseBlockFieldListeners() {
    // Regular block fields
    document.querySelectorAll('.course-block-field').forEach(field => {
        field.addEventListener('input', function() {
            const blockIndex = parseInt(this.dataset.blockIndex);
            const fieldName = this.dataset.field;
            const blocks = window.currentCourseBlocks || [];
            
            if (!blocks[blockIndex].data) {
                blocks[blockIndex].data = {};
            }
            
            // Handle array fields (items, credentials)
            if (fieldName === 'items' || fieldName === 'credentials') {
                blocks[blockIndex].data[fieldName] = this.value.split('\n').filter(item => item.trim());
            } 
            // Handle number fields
            else if (fieldName === 'price') {
                blocks[blockIndex].data[fieldName] = parseInt(this.value) || 0;
            }
            // Handle regular fields
            else {
                blocks[blockIndex].data[fieldName] = this.value;
            }
            
            window.currentCourseBlocks = blocks;
        });
    });
    
    // Drag and drop functionality
    attachCourseBlockDragAndDrop();
}

// Drag and drop for blocks
function attachCourseBlockDragAndDrop() {
    const dragHandles = document.querySelectorAll('.admin-block-drag-handle');
    let draggedElement = null;
    let draggedIndex = null;
    
    dragHandles.forEach((handle) => {
        const blockItem = handle.closest('.admin-block-item');
        
        handle.addEventListener('dragstart', function(e) {
            draggedElement = blockItem;
            draggedIndex = parseInt(blockItem.dataset.blockIndex);
            blockItem.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', blockItem.innerHTML);
        });
        
        handle.addEventListener('dragend', function(e) {
            blockItem.style.opacity = '1';
            document.querySelectorAll('.admin-block-item').forEach(el => {
                el.classList.remove('drag-over');
            });
        });
    });
    
    const blockItems = document.querySelectorAll('.admin-block-item');
    blockItems.forEach((item) => {
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
            return false;
        });
        
        item.addEventListener('dragenter', function(e) {
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
        });
        
        item.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        item.addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            if (this !== draggedElement && draggedElement) {
                const dropIndex = parseInt(this.dataset.blockIndex);
                const blocks = window.currentCourseBlocks || [];
                
                const [movedBlock] = blocks.splice(draggedIndex, 1);
                blocks.splice(dropIndex, 0, movedBlock);
                
                window.currentCourseBlocks = blocks;
                renderCourseBlocks();
            }
            
            this.classList.remove('drag-over');
            return false;
        });
    });
}

// Block management functions
window.toggleCourseBlock = function(index) {
    const body = document.getElementById(`courseBlockBody${index}`);
    const btn = body.previousElementSibling.querySelector('.toggle-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.textContent = '▼';
    } else {
        body.style.display = 'none';
        btn.textContent = '▶';
    }
};

window.deleteCourseBlock = function(index) {
    const blocks = window.currentCourseBlocks || [];
    blocks.splice(index, 1);
    window.currentCourseBlocks = blocks;
    renderCourseBlocks();
};

window.moveCourseBlockUp = function(index) {
    if (index === 0) return;
    const blocks = window.currentCourseBlocks || [];
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    window.currentCourseBlocks = blocks;
    renderCourseBlocks();
};

window.moveCourseBlockDown = function(index) {
    const blocks = window.currentCourseBlocks || [];
    if (index >= blocks.length - 1) return;
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    window.currentCourseBlocks = blocks;
    renderCourseBlocks();
};

window.addCourseBlock = function(type) {
    const blocks = window.currentCourseBlocks || [];
    const newBlock = {
        type: type,
        data: getDefaultCourseBlockData(type)
    };
    blocks.push(newBlock);
    window.currentCourseBlocks = blocks;
    renderCourseBlocks();
    
    // Scroll to new block
    setTimeout(() => {
        const newBlockEl = document.querySelector(`[data-block-index="${blocks.length - 1}"]`);
        if (newBlockEl) {
            newBlockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

// Get default block data
function getDefaultCourseBlockData(type) {
    switch (type) {
        case 'hero':
            return { image: '', title: '', price: 0, startDate: '', paymentInstructions: '' };
        case 'description':
            return { image: '', title: '', subtitle: '', contentType: '' };
        case 'program':
            return { title: 'Программа курса', items: [] };
        case 'features':
            return { image: '', imagePosition: 'right', title: '', items: [] };
        case 'author':
            return { photo: '', name: '', credentials: [] };
        default:
            return {};
    }
}



// Get blocks data for saving
window.getCourseBlocksData = function() {
    return window.currentCourseBlocks || [];
};
