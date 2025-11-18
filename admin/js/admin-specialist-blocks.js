// Specialist Page Blocks System

// Block types configuration
const BLOCK_TYPES = {
    text: {
        name: 'Блок с текстом',
        icon: '📝',
        fields: ['title', 'content']
    },
    list: {
        name: 'Блок с пунктами',
        icon: '📋',
        fields: ['title', 'items']
    },
    about: {
        name: 'Блок о специалисте',
        icon: '👤',
        fields: ['title', 'content']
    },
    payment: {
        name: 'Схема оплаты',
        icon: '💳',
        fields: ['title', 'items']
    },
    testimonials: {
        name: 'Отзывы',
        icon: '💬',
        fields: ['title', 'testimonials']
    }
};

// Generate block HTML for editing
function generateBlockEditor(block, index) {
    const blockType = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;
    
    return `
        <div class="admin-block-item" data-block-index="${index}" draggable="false">
            <div class="admin-block-header">
                <div class="admin-block-drag-handle" draggable="true" title="Перетащите для изменения порядка">⋮⋮</div>
                <span class="admin-block-icon">${blockType.icon}</span>
                <span class="admin-block-type-name">${blockType.name}</span>
                <div class="admin-block-actions">
                    <button type="button" class="admin-block-move-up-btn" onclick="moveBlockUp(${index})" ${index === 0 ? 'disabled' : ''} title="Переместить вверх">
                        ↑
                    </button>
                    <button type="button" class="admin-block-move-down-btn" onclick="moveBlockDown(${index})" title="Переместить вниз">
                        ↓
                    </button>
                    <button type="button" class="admin-block-toggle-btn" onclick="toggleBlock(${index})" title="Свернуть/Развернуть">
                        <span class="toggle-icon">▼</span>
                    </button>
                    <button type="button" class="admin-block-delete-btn" onclick="deleteBlock(${index})" title="Удалить блок">
                        ✕
                    </button>
                </div>
            </div>
            <div class="admin-block-body" id="blockBody${index}">
                ${generateBlockFields(block, index)}
            </div>
        </div>
    `;
}

// Generate fields based on block type
function generateBlockFields(block, index) {
    const type = block.type || 'text';
    
    switch(type) {
        case 'text':
        case 'about':
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${block.title || ''}" placeholder="Заголовок блока">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Текст</label>
                    <textarea class="admin-form-input block-field" rows="6"
                              data-block-index="${index}" data-field="content"
                              placeholder="Содержимое блока">${block.content || ''}</textarea>
                </div>
            `;
            
        case 'list':
        case 'payment':
            const items = block.items || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${block.title || ''}" placeholder="Заголовок блока">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Пункты (по одному на строку)</label>
                    <textarea class="admin-form-input block-field" rows="8"
                              data-block-index="${index}" data-field="items"
                              placeholder="Пункт 1\nПункт 2\nПункт 3">${items.join('\n')}</textarea>
                </div>
            `;
            
        case 'testimonials':
            const testimonials = block.testimonials || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input block-field" 
                           data-block-index="${index}" data-field="title" 
                           value="${block.title || 'Отзывы клиентов'}" placeholder="Заголовок блока">
                </div>
                <div class="admin-testimonials-list" id="testimonialsList${index}">
                    ${testimonials.map((t, i) => generateTestimonialEditor(index, i, t)).join('')}
                </div>
                <button type="button" class="admin-btn admin-btn-secondary" onclick="addTestimonial(${index})">
                    ➕ Добавить отзыв
                </button>
            `;
            
        default:
            return '<p>Неизвестный тип блока</p>';
    }
}

// Generate testimonial editor
function generateTestimonialEditor(blockIndex, testimonialIndex, testimonial = {}) {
    return `
        <div class="admin-testimonial-item" data-testimonial-index="${testimonialIndex}">
            <div class="admin-form-row">
                <div class="admin-form-group" style="flex: 3;">
                    <label class="admin-form-label">Текст отзыва</label>
                    <textarea class="admin-form-input testimonial-field" rows="3"
                              data-block-index="${blockIndex}" 
                              data-testimonial-index="${testimonialIndex}" 
                              data-field="text"
                              placeholder="Текст отзыва">${testimonial.text || ''}</textarea>
                </div>
                <div class="admin-form-group" style="flex: 1;">
                    <label class="admin-form-label">Автор</label>
                    <input type="text" class="admin-form-input testimonial-field"
                           data-block-index="${blockIndex}" 
                           data-testimonial-index="${testimonialIndex}" 
                           data-field="author"
                           value="${testimonial.author || ''}" placeholder="Имя автора">
                </div>
                <div class="admin-form-group" style="flex: 0;">
                    <label class="admin-form-label">&nbsp;</label>
                    <button type="button" class="admin-btn admin-btn-danger" 
                            onclick="deleteTestimonial(${blockIndex}, ${testimonialIndex})">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Block management functions
window.toggleBlock = function(index) {
    const body = document.getElementById(`blockBody${index}`);
    const btn = body.previousElementSibling.querySelector('.toggle-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.textContent = '▼';
    } else {
        body.style.display = 'none';
        btn.textContent = '▶';
    }
};

window.deleteBlock = function(index) {
    const blocks = window.currentSpecialistBlocks || [];
    blocks.splice(index, 1);
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
};

window.moveBlockUp = function(index) {
    if (index === 0) return;
    const blocks = window.currentSpecialistBlocks || [];
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
};

window.moveBlockDown = function(index) {
    const blocks = window.currentSpecialistBlocks || [];
    if (index >= blocks.length - 1) return;
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
};

window.addBlock = function(type) {
    const blocks = window.currentSpecialistBlocks || [];
    const newBlock = {
        type: type,
        title: '',
        content: '',
        items: [],
        testimonials: []
    };
    blocks.push(newBlock);
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
    
    // Scroll to new block
    setTimeout(() => {
        const newBlockEl = document.querySelector(`[data-block-index="${blocks.length - 1}"]`);
        if (newBlockEl) {
            newBlockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

window.addTestimonial = function(blockIndex) {
    const blocks = window.currentSpecialistBlocks || [];
    if (!blocks[blockIndex].testimonials) {
        blocks[blockIndex].testimonials = [];
    }
    blocks[blockIndex].testimonials.push({ text: '', author: '' });
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
};

window.deleteTestimonial = function(blockIndex, testimonialIndex) {
    const blocks = window.currentSpecialistBlocks || [];
    blocks[blockIndex].testimonials.splice(testimonialIndex, 1);
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
};

// Render all blocks
function renderBlocks() {
    const container = document.getElementById('specialistBlocksContainer');
    if (!container) return;
    
    const blocks = window.currentSpecialistBlocks || [];
    container.innerHTML = blocks.map((block, index) => generateBlockEditor(block, index)).join('');
    
    // Attach event listeners for field updates
    attachBlockFieldListeners();
}

// Attach listeners to update blocks data
function attachBlockFieldListeners() {
    // Regular block fields
    document.querySelectorAll('.block-field').forEach(field => {
        field.addEventListener('input', function() {
            const blockIndex = parseInt(this.dataset.blockIndex);
            const fieldName = this.dataset.field;
            const blocks = window.currentSpecialistBlocks || [];
            
            if (fieldName === 'items') {
                blocks[blockIndex][fieldName] = this.value.split('\n').filter(item => item.trim());
            } else {
                blocks[blockIndex][fieldName] = this.value;
            }
            
            window.currentSpecialistBlocks = blocks;
        });
    });
    
    // Testimonial fields
    document.querySelectorAll('.testimonial-field').forEach(field => {
        field.addEventListener('input', function() {
            const blockIndex = parseInt(this.dataset.blockIndex);
            const testimonialIndex = parseInt(this.dataset.testimonialIndex);
            const fieldName = this.dataset.field;
            const blocks = window.currentSpecialistBlocks || [];
            
            if (!blocks[blockIndex].testimonials[testimonialIndex]) {
                blocks[blockIndex].testimonials[testimonialIndex] = {};
            }
            
            blocks[blockIndex].testimonials[testimonialIndex][fieldName] = this.value;
            window.currentSpecialistBlocks = blocks;
        });
    });
    
    // Drag and drop functionality
    attachDragAndDrop();
}

// Drag and drop for blocks
function attachDragAndDrop() {
    const dragHandles = document.querySelectorAll('.admin-block-drag-handle');
    let draggedElement = null;
    let draggedIndex = null;
    
    dragHandles.forEach((handle) => {
        const blockItem = handle.closest('.admin-block-item');
        
        // Drag start - only from handle
        handle.addEventListener('dragstart', function(e) {
            draggedElement = blockItem;
            draggedIndex = parseInt(blockItem.dataset.blockIndex);
            blockItem.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', blockItem.innerHTML);
        });
        
        // Drag end
        handle.addEventListener('dragend', function(e) {
            blockItem.style.opacity = '1';
            // Remove all drag-over classes
            document.querySelectorAll('.admin-block-item').forEach(el => {
                el.classList.remove('drag-over');
            });
        });
    });
    
    // Add drop zones to all block items
    const blockItems = document.querySelectorAll('.admin-block-item');
    blockItems.forEach((item) => {
        // Drag over
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
            return false;
        });
        
        // Drag enter
        item.addEventListener('dragenter', function(e) {
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
        });
        
        // Drag leave
        item.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        // Drop
        item.addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            if (this !== draggedElement && draggedElement) {
                const dropIndex = parseInt(this.dataset.blockIndex);
                const blocks = window.currentSpecialistBlocks || [];
                
                // Remove dragged block
                const [movedBlock] = blocks.splice(draggedIndex, 1);
                
                // Insert at new position
                blocks.splice(dropIndex, 0, movedBlock);
                
                window.currentSpecialistBlocks = blocks;
                renderBlocks();
            }
            
            this.classList.remove('drag-over');
            return false;
        });
    });
}

// Initialize blocks system
window.initBlocksSystem = function(blocks = []) {
    window.currentSpecialistBlocks = blocks;
    renderBlocks();
};

// Get blocks data
window.getBlocksData = function() {
    return window.currentSpecialistBlocks || [];
};
