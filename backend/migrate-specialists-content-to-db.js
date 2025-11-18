const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');

console.log('🚀 Миграция контента специалистов в БД\n');
console.log('='.repeat(70));

let db;

// Читаем данные специалистов
const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
const specialists = specialistsData.specialists;

// Функция для создания блоков на основе данных
function generateBlocks(specialist) {
    const blocks = [];
    
    // 1. Блок "О специалисте" (если есть роль или дополнительные услуги)
    if (specialist.role || specialist.additionalServices) {
        let content = '';
        if (specialist.role) {
            content += specialist.role;
        }
        if (specialist.additionalServices) {
            if (content) content += '\n\n';
            content += specialist.additionalServices;
        }
        
        blocks.push({
            type: 'about',
            title: 'О специалисте',
            content: content
        });
    }
    
    // 2. Блок "Методы терапии" (список)
    if (specialist.therapyMethods && specialist.therapyMethods.length > 0) {
        blocks.push({
            type: 'list',
            title: 'Методы терапии',
            items: specialist.therapyMethods
        });
    }
    
    // 3. Блок "Образование" (список)
    if (specialist.education && specialist.education.length > 0) {
        blocks.push({
            type: 'list',
            title: 'Образование и квалификация',
            items: specialist.education
        });
    }
    
    // 4. Блок "Специализации" (список)
    if (specialist.specializations && specialist.specializations.length > 0) {
        blocks.push({
            type: 'list',
            title: 'Специализации',
            items: specialist.specializations
        });
    }
    
    // 5. Блок "Отзывы" (если есть)
    if (specialist.testimonials && specialist.testimonials.length > 0) {
        blocks.push({
            type: 'testimonials',
            title: 'Отзывы клиентов',
            testimonials: specialist.testimonials
        });
    }
    
    return blocks;
}

// Функция для обновления специалиста в БД
function updateSpecialist(id, data) {
    try {
        const fields = [];
        const values = [];
        
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        
        values.push(id);
        
        const sql = `UPDATE specialists SET ${fields.join(', ')} WHERE id = ?`;
        db.run(sql, values);
        
        return true;
    } catch (error) {
        console.error(`Ошибка обновления специалиста ${id}:`, error.message);
        return false;
    }
}

// Основная функция
async function main() {
    try {
        // Инициализируем БД
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к БД\n');
        console.log(`📋 Специалистов для обработки: ${specialists.length}\n`);
        
        let successCount = 0;
        let errorCount = 0;
        let blocksCreated = 0;
        let testimonialsAdded = 0;
        
        for (const specialist of specialists) {
            console.log(`\n[${specialist.id}] ${specialist.name}`);
            console.log('-'.repeat(70));
            
            try {
                // Генерируем блоки
                const blocks = generateBlocks(specialist);
                console.log(`📦 Блоков сгенерировано: ${blocks.length}`);
                
                // Подготавливаем данные для обновления
                const updateData = {};
                
                // Описание (роль)
                if (specialist.role) {
                    updateData.description = specialist.role;
                }
                
                // Образование (объединяем в текст)
                if (specialist.education && specialist.education.length > 0) {
                    updateData.education = specialist.education.join('\n');
                }
                
                // Дополнительные услуги
                if (specialist.additionalServices) {
                    updateData.additional_services = specialist.additionalServices;
                }
                
                // Специализация (первая из списка или роль)
                if (specialist.specializations && specialist.specializations.length > 0) {
                    updateData.specialization = specialist.specializations.join(', ');
                } else if (specialist.role) {
                    updateData.specialization = specialist.role;
                }
                
                // Отзывы (JSON)
                if (specialist.testimonials && specialist.testimonials.length > 0) {
                    updateData.testimonials = JSON.stringify(specialist.testimonials);
                    testimonialsAdded += specialist.testimonials.length;
                    console.log(`💬 Отзывов: ${specialist.testimonials.length}`);
                }
                
                // Блоки страницы (JSON)
                if (blocks.length > 0) {
                    updateData.page_blocks = JSON.stringify(blocks);
                    blocksCreated += blocks.length;
                    
                    // Выводим типы блоков
                    const blockTypes = blocks.map(b => b.type).join(', ');
                    console.log(`📋 Типы блоков: ${blockTypes}`);
                }
                
                // Обновляем специалиста
                const updated = updateSpecialist(specialist.id, updateData);
                
                if (updated) {
                    console.log(`✅ Обновлено`);
                    successCount++;
                } else {
                    console.log(`⚠️  Не обновлено`);
                    errorCount++;
                }
                
            } catch (error) {
                console.log(`❌ Ошибка: ${error.message}`);
                errorCount++;
            }
        }
        
        // Сохраняем БД
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 ИТОГИ:');
        console.log(`   ✅ Успешно обновлено: ${successCount}`);
        console.log(`   ❌ Ошибок: ${errorCount}`);
        console.log(`   📦 Блоков создано: ${blocksCreated}`);
        console.log(`   💬 Отзывов добавлено: ${testimonialsAdded}`);
        console.log('='.repeat(70) + '\n');
        
        if (successCount > 0) {
            console.log('🎉 Контент специалистов загружен в БД!');
            console.log('💾 Изменения сохранены в database.sqlite\n');
        }
        
        db.close();
        
    } catch (error) {
        console.error('\n❌ Критическая ошибка:', error);
        if (db) db.close();
        process.exit(1);
    }
}

main();
