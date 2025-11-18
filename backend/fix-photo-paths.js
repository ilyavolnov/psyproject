const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'specialists');

console.log('🔧 Исправление путей к фотографиям в БД\n');
console.log('='.repeat(70));

async function main() {
    try {
        // Инициализируем БД
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к БД\n');
        
        // Получаем всех специалистов
        const result = db.exec('SELECT id, name, photo FROM specialists ORDER BY id');
        
        if (result.length === 0) {
            console.log('⚠️  Специалисты не найдены');
            return;
        }
        
        const specialists = result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            photo: row[2]
        }));
        
        console.log(`📋 Специалистов: ${specialists.length}\n`);
        
        // Получаем список всех доступных фотографий
        const availablePhotos = fs.readdirSync(IMAGES_DIR)
            .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp'))
            .filter(f => f.startsWith('specialist_'));
        
        console.log(`📸 Доступно фотографий: ${availablePhotos.length}\n`);
        
        let updatedCount = 0;
        let unchangedCount = 0;
        
        for (const specialist of specialists) {
            // Пропускаем если уже есть правильное фото (не hero-page.webp)
            if (specialist.photo && !specialist.photo.includes('hero-page.webp')) {
                console.log(`ℹ️  [${specialist.id}] ${specialist.name} - уже имеет фото`);
                unchangedCount++;
                continue;
            }
            
            // Ищем фото для этого специалиста
            const photoFile = availablePhotos.find(f => 
                f.includes(`specialist_${specialist.id}_`) ||
                f.startsWith(`specialist_${specialist.id}_`)
            );
            
            if (!photoFile) {
                console.log(`⚠️  [${specialist.id}] ${specialist.name} - фото не найдено`);
                continue;
            }
            
            const newPath = `images/specialists/${photoFile}`;
            
            // Обновляем в БД
            db.run('UPDATE specialists SET photo = ? WHERE id = ?', [newPath, specialist.id]);
            
            console.log(`✅ [${specialist.id}] ${specialist.name} → ${photoFile}`);
            updatedCount++;
        }
        
        // Сохраняем БД
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 ИТОГИ:');
        console.log(`   ✅ Обновлено: ${updatedCount}`);
        console.log(`   ℹ️  Без изменений: ${unchangedCount}`);
        console.log('='.repeat(70) + '\n');
        console.log('🎉 Пути к фотографиям исправлены в БД!\n');
        
        db.close();
        
    } catch (error) {
        console.error('\n❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
