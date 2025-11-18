const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const JSON_PATH = path.join(__dirname, '..', 'specialists-data.json');

console.log('🗑️  Удаление всех специалистов\n');
console.log('='.repeat(70));

async function main() {
    try {
        // 1. Очистка БД
        console.log('\n1️⃣  Очистка базы данных...');
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(filebuffer);
        
        // Получаем количество до удаления
        const countBefore = db.exec('SELECT COUNT(*) as count FROM specialists');
        const count = countBefore[0].values[0][0];
        console.log(`   Специалистов в БД: ${count}`);
        
        // Удаляем всех специалистов
        db.run('DELETE FROM specialists');
        
        // Сбрасываем автоинкремент
        db.run('DELETE FROM sqlite_sequence WHERE name="specialists"');
        
        // Сохраняем БД
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
        
        console.log('   ✅ Все специалисты удалены из БД');
        
        db.close();
        
        // 2. Очистка JSON
        console.log('\n2️⃣  Очистка specialists-data.json...');
        const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        console.log(`   Специалистов в JSON: ${jsonData.specialists.length}`);
        
        jsonData.specialists = [];
        
        fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log('   ✅ Все специалисты удалены из JSON');
        
        // 3. Информация о фотографиях
        console.log('\n3️⃣  Фотографии (не удаляются автоматически):');
        const imagesDir = path.join(__dirname, '..', 'images', 'specialists');
        if (fs.existsSync(imagesDir)) {
            const photos = fs.readdirSync(imagesDir).filter(f => 
                f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
            );
            console.log(`   📸 Фотографий в директории: ${photos.length}`);
            console.log('   ℹ️  Чтобы удалить фотографии, выполните:');
            console.log('      rm images/specialists/*.jpg');
            console.log('      rm images/specialists/*.jpeg');
            console.log('      rm images/specialists/*.png');
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ ГОТОВО!\n');
        console.log('📋 Что удалено:');
        console.log(`   • ${count} специалистов из БД`);
        console.log(`   • ${jsonData.specialists.length} специалистов из JSON`);
        console.log('\n💡 Теперь можно начать заново!');
        console.log('='.repeat(70) + '\n');
        
    } catch (error) {
        console.error('\n❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
