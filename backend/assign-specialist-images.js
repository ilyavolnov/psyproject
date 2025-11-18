const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Конфигурация
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'specialists');

// УКАЖИТЕ ЗДЕСЬ URL ИЗОБРАЖЕНИЙ В ПОРЯДКЕ СПЕЦИАЛИСТОВ
const IMAGE_URLS = [
    // Маргарита Румянцева
    'https://example.com/rumyantseva.jpg',
    
    // Ольга П.
    'https://example.com/olya_p.jpg',
    
    // Добавьте остальные URL...
];

// Создаем директорию для изображений
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('✅ Создана директория:', IMAGES_DIR);
}

// Функция для загрузки файла
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const request = protocol.get(url, (response) => {
            // Обработка редиректов
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${url}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filepath);
            });
            
            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => {});
                reject(err);
            });
        });
        
        request.on('error', reject);
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Основная функция
async function main() {
    console.log('🚀 Загрузка изображений специалистов\n');
    console.log('=' .repeat(60));
    
    // Читаем данные специалистов
    const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
    const specialists = specialistsData.specialists;
    
    console.log(`\n📋 Всего специалистов: ${specialists.length}`);
    console.log(`🖼️  URL изображений: ${IMAGE_URLS.length}\n`);
    
    if (IMAGE_URLS.length === 0 || IMAGE_URLS[0].includes('example.com')) {
        console.log('⚠️  ВНИМАНИЕ: Необходимо указать реальные URL изображений!');
        console.log('\n📝 Инструкция:');
        console.log('1. Откройте файл: backend/assign-specialist-images.js');
        console.log('2. Найдите массив IMAGE_URLS');
        console.log('3. Замените example.com на реальные URL изображений');
        console.log('4. Запустите скрипт снова: node backend/assign-specialist-images.js\n');
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Загружаем изображения
    for (let i = 0; i < specialists.length; i++) {
        const specialist = specialists[i];
        const imageUrl = IMAGE_URLS[i];
        
        console.log(`\n[${i + 1}/${specialists.length}] ${specialist.name}`);
        console.log('-'.repeat(60));
        
        if (!imageUrl) {
            console.log('⏭️  Пропущено: нет URL изображения');
            errorCount++;
            continue;
        }
        
        // Определяем имя файла из specialists-data.json
        const filename = specialist.photo.split('/').pop();
        const filepath = path.join(IMAGES_DIR, filename);
        
        // Проверяем, существует ли уже файл
        if (fs.existsSync(filepath)) {
            console.log(`ℹ️  Файл уже существует: ${filename}`);
            console.log('   Пропускаем загрузку...');
            successCount++;
            continue;
        }
        
        try {
            console.log(`⬇️  Загрузка: ${imageUrl}`);
            console.log(`💾 Сохранение: ${filename}`);
            
            await downloadFile(imageUrl, filepath);
            
            const stats = fs.statSync(filepath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);
            
            console.log(`✅ Успешно! Размер: ${fileSizeKB} KB`);
            successCount++;
            
        } catch (error) {
            console.log(`❌ Ошибка: ${error.message}`);
            errorCount++;
        }
    }
    
    // Итоги
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГИ:');
    console.log(`   ✅ Успешно: ${successCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(`   📁 Директория: ${IMAGES_DIR}`);
    console.log('='.repeat(60) + '\n');
    
    if (successCount > 0) {
        console.log('🎉 Изображения загружены!');
        console.log('💡 Проверьте директорию: images/specialists/\n');
    }
}

// Запуск
main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
