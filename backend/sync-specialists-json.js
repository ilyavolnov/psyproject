const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const JSON_PATH = path.join(__dirname, '..', 'specialists-data.json');

console.log('🔄 Синхронизация specialists-data.json с БД\n');
console.log('='.repeat(70));

async function main() {
    try {
        // Читаем текущий JSON
        const currentJson = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        
        // Инициализируем БД
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к БД\n');
        
        // Получаем данные из БД
        const result = db.exec('SELECT * FROM specialists ORDER BY id');
        
        if (result.length === 0) {
            console.log('⚠️  Специалисты не найдены в БД');
            return;
        }
        
        const columns = result[0].columns;
        const dbSpecialists = result[0].values.map(row => {
            const specialist = {};
            columns.forEach((col, i) => {
                specialist[col] = row[i];
            });
            return specialist;
        });
        
        console.log(`📋 Специалистов в БД: ${dbSpecialists.length}`);
        console.log(`📋 Специалистов в JSON: ${currentJson.specialists.length}\n`);
        
        // Обновляем JSON данные из БД
        const updatedSpecialists = currentJson.specialists.map(jsonSpec => {
            const dbSpec = dbSpecialists.find(db => db.id === jsonSpec.id);
            
            if (!dbSpec) {
                console.log(`⚠️  [${jsonSpec.id}] ${jsonSpec.name} - не найден в БД`);
                return jsonSpec;
            }
            
            // Обновляем поля из БД
            const updated = { ...jsonSpec };
            
            // Основные поля
            if (dbSpec.photo) updated.photo = dbSpec.photo;
            if (dbSpec.name) updated.name = dbSpec.name;
            if (dbSpec.specialization) updated.role = dbSpec.specialization;
            if (dbSpec.experience) updated.experience = dbSpec.experience;
            if (dbSpec.price) updated.price = dbSpec.price;
            if (dbSpec.status) updated.status = dbSpec.status;
            if (dbSpec.description) updated.description = dbSpec.description;
            
            // Образование (из текста в массив)
            if (dbSpec.education) {
                updated.education = dbSpec.education.split('\n').filter(e => e.trim());
            }
            
            // Дополнительные услуги
            if (dbSpec.additional_services) {
                updated.additionalServices = dbSpec.additional_services;
            }
            
            // Отзывы (парсим JSON)
            if (dbSpec.testimonials) {
                try {
                    updated.testimonials = JSON.parse(dbSpec.testimonials);
                } catch (e) {
                    console.log(`⚠️  [${jsonSpec.id}] Ошибка парсинга отзывов`);
                }
            }
            
            // Блоки страницы (парсим JSON)
            if (dbSpec.page_blocks) {
                try {
                    updated.page_blocks = JSON.parse(dbSpec.page_blocks);
                } catch (e) {
                    console.log(`⚠️  [${jsonSpec.id}] Ошибка парсинга блоков`);
                }
            }
            
            console.log(`✅ [${jsonSpec.id}] ${jsonSpec.name} - обновлен`);
            
            return updated;
        });
        
        // Сохраняем обновленный JSON
        const updatedJson = {
            ...currentJson,
            specialists: updatedSpecialists
        };
        
        fs.writeFileSync(JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 ИТОГИ:');
        console.log(`   ✅ Обновлено специалистов: ${updatedSpecialists.length}`);
        console.log(`   📄 Файл: ${JSON_PATH}`);
        console.log('='.repeat(70) + '\n');
        console.log('🎉 Синхронизация завершена!\n');
        
        db.close();
        
    } catch (error) {
        console.error('\n❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
