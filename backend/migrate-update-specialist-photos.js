const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');

// Читаем данные специалистов из JSON
const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
const specialists = specialistsData.specialists;

console.log('🚀 Обновление фотографий специалистов в базе данных\n');
console.log('='.repeat(70));

let db;

// Функция для обновления фото специалиста
function updateSpecialistPhoto(id, name, photo) {
    try {
        const sql = `UPDATE specialists SET photo = ? WHERE id = ?`;
        db.run(sql, [photo, id]);
        return 1;
    } catch (error) {
        throw error;
    }
}

// Функция для получения текущих данных специалиста
function getSpecialist(id) {
    try {
        const result = db.exec('SELECT * FROM specialists WHERE id = ?', [id]);
        if (result.length > 0 && result[0].values.length > 0) {
            const columns = result[0].columns;
            const values = result[0].values[0];
            const row = {};
            columns.forEach((col, i) => {
                row[col] = values[i];
            });
            return row;
        }
        return null;
    } catch (error) {
        throw error;
    }
}

// Основная функция
async function migrate() {
    let successCount = 0;
    let errorCount = 0;
    let unchangedCount = 0;
    
    console.log(`📋 Специалистов для обновления: ${specialists.length}\n`);
    
    for (const specialist of specialists) {
        const { id, name, photo } = specialist;
        
        try {
            // Получаем текущие данные
            const current = getSpecialist(id);
            
            if (!current) {
                console.log(`⚠️  [${id}] ${name} - не найден в БД`);
                errorCount++;
                continue;
            }
            
            // Проверяем нужно ли обновлять
            if (current.photo === photo) {
                console.log(`ℹ️  [${id}] ${name} - фото уже актуально`);
                unchangedCount++;
                continue;
            }
            
            // Обновляем фото
            const changes = updateSpecialistPhoto(id, name, photo);
            
            if (changes > 0) {
                console.log(`✅ [${id}] ${name}`);
                console.log(`   Старое: ${current.photo}`);
                console.log(`   Новое:  ${photo}`);
                successCount++;
            } else {
                console.log(`⚠️  [${id}] ${name} - не обновлено`);
                errorCount++;
            }
            
        } catch (error) {
            console.log(`❌ [${id}] ${name} - ошибка: ${error.message}`);
            errorCount++;
        }
    }
    
    // Сохраняем изменения в файл
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    
    // Итоги
    console.log('\n' + '='.repeat(70));
    console.log('📊 ИТОГИ:');
    console.log(`   ✅ Обновлено: ${successCount}`);
    console.log(`   ℹ️  Без изменений: ${unchangedCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log('='.repeat(70) + '\n');
    
    if (successCount > 0) {
        console.log('🎉 Фотографии специалистов обновлены в базе данных!');
        console.log('💾 Изменения сохранены в psychology.db\n');
    }
    
    db.close();
}

// Запуск
(async () => {
    try {
        // Инициализируем SQL.js
        const SQL = await initSqlJs();
        
        // Загружаем базу данных
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к базе данных\n');
        
        // Запускаем миграцию
        await migrate();
        
    } catch (error) {
        console.error('\n❌ Критическая ошибка:', error);
        process.exit(1);
    }
})();
