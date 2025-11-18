const https = require('https');
const fs = require('fs');
const path = require('path');

// Конфигурация
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'specialists');

// Маппинг URL изображений со страницы (из вывода скрипта)
const IMAGE_URLS = [
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_1094.jpeg', // 1. Маргарита Румянцева
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/11/023-scaled-e1730970707478.jpg', // 2. Ольга П.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/zapis-vremeeno-zakryta-3-2.png', // 3. Анна Б.
    'https://dr-rumyantceva.ru/wp-content/uploads/2025/03/izobrazhenie-whatsapp-2025-03-27-v-19.23.30_b77dfcf8.jpg', // 4. Анастасия
    'https://dr-rumyantceva.ru/wp-content/uploads/2025/04/photo_2025-04-02_17-49-11-e1744201847324.jpg', // 5. Марина
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/03/anastasiya-e1719230354596.jpeg', // 6. Ольга
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/jbs_1624-2-e1719231365778.jpg', // 7. Ульяна
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/12/izobrazhenie-whatsapp-2024-12-02-v-11.50.33_4d5ad93f-e1733202548684.jpg', // 8. Юлия С.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/image0-scaled-1-e1719231225661.jpeg', // 9. Павел
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/dscf2496-scaled-1-e1719230972865.jpg', // 10. Владимир
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/whatsapp-image-2020-05-11-at-12.11.39-e1719230722360.jpg', // 11. Анастасия П.
    'https://dr-rumyantceva.ru/wp-content/uploads/2025/04/photo_2025-04-09_15-50-41.jpg', // 12. Мария Р.
    'https://dr-rumyantceva.ru/wp-content/uploads/2025/04/img_3873.png', // 13. Вера
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_6043-e1755688473475.jpeg', // 14. Марина М.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/047-scaled-e1730965438114.jpg', // 15. Анна Ж.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/11/foto-dlya-sajta-1.jpg', // 16. Наталья
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/img_9117-e1719230608426.jpg', // 17. Надежда Л.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_1230-e1732895412562.jpeg', // 18. Надежда
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/dsc_6477-1024x684-1.jpg', // 19. Элеонора
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/03/ter_9724_2-scaled-1-e1719230309928.jpg', // 20. Елена К.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/img_7167-e1719231380520.png', // 21. Елена
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/03/elena-e1719230415923.jpg', // 22. Мария
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/iness-e1719231149886.jpg', // 23. Елена Ч.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/176-e1730966781232.jpg', // 24. Инесса
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/liza-3-e1719231135562.jpg', // 25. Наталья Г.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_5942-e1755204661116.jpeg', // 26. Елизавета
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_0220-e1730965783389.jpeg', // 27. Мария С.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/anna-s-e1719231237110.jpg', // 28. Наталья С.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/c1547322-14ee-47f2-bd24-e8dd0b150b8c-e1719230640942.jpeg', // 29. Анна С.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/zapis-vremeeno-zakryta-1.png', // 30. Наталья Я.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/bez-imeni-3-e1719230955680.png', // 31. Наталья Ш.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_0874-e1730966362119.jpeg', // 32. Анастасия Б.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/113-e1730966549643.jpg', // 33. Екатерина М.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/dsc04372-scaled-e1730998108272.jpg', // 34. Екатерина
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/photo_2024-06-24_15-08-10.jpg', // 35. Динара
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/099-1-e1730966210434.jpg', // 36. Елена В.
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_4161-scaled-e1745840017476.jpeg', // 37. Анна
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_3048.jpeg', // 38. Евгения
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/dsc_4707-scaled-1-e1719230827574.jpg', // 39. Юлия
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/dsc_4707-scaled-1-e1719230827574.jpg', // 40. Валерия (дубль)
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/05/dsc_4707-scaled-1-e1719230827574.jpg', // 41. Татьяна (дубль)
    'https://dr-rumyantceva.ru/wp-content/uploads/2024/09/img_3048.jpeg', // 42. Маргарита М.
];

// Функция для загрузки изображения
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadImage(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filepath);
            });
            
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

// Генерация имени файла из имени специалиста
function generateFilename(name, index) {
    const normalized = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zа-я0-9_]/g, '')
        .replace(/_+/g, '_');
    
    const ext = '.jpg';
    return `specialist_${index + 1}_${normalized}${ext}`;
}

// Основная функция
async function main() {
    console.log('🚀 Обновление фотографий специалистов\n');
    console.log('='.repeat(70));
    
    // Читаем данные
    const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
    const specialists = specialistsData.specialists;
    
    console.log(`\n📋 Специалистов: ${specialists.length}`);
    console.log(`🖼️  URL изображений: ${IMAGE_URLS.length}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let updatedCount = 0;
    
    // Обрабатываем каждого специалиста
    for (let i = 0; i < specialists.length; i++) {
        const specialist = specialists[i];
        const imageUrl = IMAGE_URLS[i];
        
        console.log(`\n[${i + 1}/${specialists.length}] ${specialist.name}`);
        console.log('-'.repeat(70));
        
        if (!imageUrl) {
            console.log('⏭️  Пропущено: нет URL');
            errorCount++;
            continue;
        }
        
        // Генерируем новое имя файла
        const newFilename = generateFilename(specialist.name, i);
        const filepath = path.join(IMAGES_DIR, newFilename);
        const newPhotoPath = `images/specialists/${newFilename}`;
        
        // Проверяем нужно ли обновлять
        if (fs.existsSync(filepath) && specialist.photo === newPhotoPath) {
            console.log(`ℹ️  Уже актуально: ${newFilename}`);
            successCount++;
            continue;
        }
        
        try {
            console.log(`⬇️  URL: ${imageUrl.substring(0, 60)}...`);
            console.log(`💾 Файл: ${newFilename}`);
            
            // Загружаем если файла нет
            if (!fs.existsSync(filepath)) {
                await downloadImage(imageUrl, filepath);
                
                const stats = fs.statSync(filepath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`✅ Загружено: ${sizeKB} KB`);
            } else {
                console.log(`ℹ️  Файл существует`);
            }
            
            // Обновляем путь в JSON
            if (specialist.photo !== newPhotoPath) {
                specialist.photo = newPhotoPath;
                updatedCount++;
                console.log(`📝 Обновлен путь: ${newPhotoPath}`);
            }
            
            successCount++;
            
            // Задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.log(`❌ Ошибка: ${error.message}`);
            errorCount++;
        }
    }
    
    // Сохраняем обновленный JSON
    if (updatedCount > 0) {
        fs.writeFileSync(SPECIALISTS_JSON, JSON.stringify(specialistsData, null, 2), 'utf8');
        console.log(`\n💾 Сохранено изменений в specialists-data.json: ${updatedCount}`);
    }
    
    // Итоги
    console.log('\n' + '='.repeat(70));
    console.log('📊 ИТОГИ:');
    console.log(`   ✅ Успешно: ${successCount}`);
    console.log(`   📝 Обновлено путей: ${updatedCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(`   📁 Директория: ${IMAGES_DIR}`);
    console.log('='.repeat(70) + '\n');
    
    if (successCount > 0) {
        console.log('🎉 Фотографии обновлены!');
    }
}

// Запуск
main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
