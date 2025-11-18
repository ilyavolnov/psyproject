const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');

console.log('🔧 Исправление соответствия фотографий специалистов\n');
console.log('='.repeat(70));

// Правильный маппинг: ID специалиста -> имя файла изображения
// Этот маппинг нужно заполнить вручную, проверив каждое фото
const CORRECT_PHOTO_MAPPING = {
    // Пример:
    // 1: 'specialist_1_маргарита_румянцева.jpg',
    // 2: 'specialist_5_марина.jpg',  // если фото Марины подходит для Ольги П.
    // и т.д.
};

async function main() {
    try {
        // Инициализируем БД
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к БД\n');
        
        // Получаем список всех специалистов
        const result = db.exec('SELECT id, name, photo FROM specialists ORDER BY id');
        
        if (result.length === 0) {
            console.log('⚠️  Специалисты не найдены в БД');
            return;
        }
        
        const specialists = result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            photo: row[2]
        }));
        
        console.log('📋 Текущие фотографии специалистов:\n');
        
        specialists.forEach(spec => {
            const filename = spec.photo ? spec.photo.split('/').pop() : 'НЕТ';
            console.log(`[${spec.id}] ${spec.name.padEnd(25)} → ${filename}`);
        });
        
        console.log('\n' + '='.repeat(70));
        console.log('\n💡 ИНСТРУКЦИЯ ПО ИСПРАВЛЕНИЮ:\n');
        console.log('1. Откройте директорию: images/specialists/');
        console.log('2. Просмотрите каждое изображение');
        console.log('3. Сопоставьте изображения с именами специалистов');
        console.log('4. Заполните маппинг в файле: backend/fix-specialist-photos-mapping.js');
        console.log('5. Запустите скрипт снова\n');
        
        console.log('Пример маппинга:');
        console.log('```javascript');
        console.log('const CORRECT_PHOTO_MAPPING = {');
        console.log('    1: "specialist_1_маргарита_румянцева.jpg",  // Маргарита Румянцева');
        console.log('    2: "specialist_15_анна_ж.jpg",              // Ольга П. (если её фото это specialist_15)');
        console.log('    3: "specialist_3_анна_б.jpg",               // Анна Б.');
        console.log('    // ... и так далее');
        console.log('};');
        console.log('```\n');
        
        // Если маппинг заполнен, применяем изменения
        if (Object.keys(CORRECT_PHOTO_MAPPING).length > 0) {
            console.log('🔄 Применение исправлений...\n');
            
            let updatedCount = 0;
            
            for (const [id, filename] of Object.entries(CORRECT_PHOTO_MAPPING)) {
                const photoPath = `images/specialists/${filename}`;
                const specialist = specialists.find(s => s.id === parseInt(id));
                
                if (!specialist) {
                    console.log(`⚠️  Специалист с ID ${id} не найден`);
                    continue;
                }
                
                // Проверяем существование файла
                const fullPath = path.join(__dirname, '..', photoPath);
                if (!fs.existsSync(fullPath)) {
                    console.log(`⚠️  Файл не найден: ${filename}`);
                    continue;
                }
                
                // Обновляем в БД
                db.run('UPDATE specialists SET photo = ? WHERE id = ?', [photoPath, id]);
                
                console.log(`✅ [${id}] ${specialist.name} → ${filename}`);
                updatedCount++;
            }
            
            // Сохраняем БД
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(DB_PATH, buffer);
            
            console.log('\n' + '='.repeat(70));
            console.log(`📊 Обновлено фотографий: ${updatedCount}`);
            console.log('💾 Изменения сохранены в БД\n');
        }
        
        db.close();
        
    } catch (error) {
        console.error('\n❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
