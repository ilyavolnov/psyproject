const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Конфигурация
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'specialists');

// URL страницы с изображениями
const SOURCE_PAGE_URL = process.argv[2] || 'https://dr-rumyantceva.ru/specialists/';

// Создаем директорию для изображений если её нет
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Функция для загрузки файла
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Редирект
                downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
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
        }).on('error', reject);
    });
}

// Функция для извлечения изображений из HTML
async function extractImagesFromPage(pageUrl) {
    return new Promise((resolve, reject) => {
        const protocol = pageUrl.startsWith('https') ? https : http;
        
        protocol.get(pageUrl, (response) => {
            let html = '';
            
            response.on('data', (chunk) => {
                html += chunk;
            });
            
            response.on('end', () => {
                // Ищем все img теги
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                const images = [];
                let match;
                
                while ((match = imgRegex.exec(html)) !== null) {
                    images.push(match[1]);
                }
                
                resolve(images);
            });
        }).on('error', reject);
    });
}

// Основная функция
async function main() {
    console.log('🚀 Начинаем загрузку изображений специалистов...\n');
    
    // Читаем данные специалистов
    const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
    const specialists = specialistsData.specialists;
    
    console.log(`📋 Найдено специалистов: ${specialists.length}\n`);
    
    // Извлекаем изображения со страницы
    console.log(`🌐 Извлекаем изображения со страницы: ${SOURCE_PAGE_URL}`);
    let imageUrls = [];
    
    try {
        imageUrls = await extractImagesFromPage(SOURCE_PAGE_URL);
        console.log(`✅ Найдено изображений на странице: ${imageUrls.length}\n`);
        
        // Фильтруем только изображения специалистов
        imageUrls = imageUrls.filter(url => {
            return url.includes('specialist') || 
                   url.includes('images/') || 
                   url.match(/\.(jpg|jpeg|png|webp)$/i);
        });
        
        console.log(`🎯 Отфильтровано изображений специалистов: ${imageUrls.length}\n`);
        
        // Выводим найденные URL
        if (imageUrls.length > 0) {
            console.log('📋 Найденные изображения:');
            imageUrls.forEach((url, i) => {
                console.log(`   ${i + 1}. ${url}`);
            });
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Ошибка при извлечении изображений:', error.message);
    }
    
    // Если изображений нет, показываем инструкцию
    if (imageUrls.length === 0) {
        console.log('⚠️  Изображения не найдены на странице.');
        console.log('💡 Попробуйте:');
        console.log('   1. Проверьте URL страницы');
        console.log('   2. Используйте другой URL: node backend/download-specialist-images.js <URL>\n');
        return;
    }
    
    // Загружаем изображения для каждого специалиста
    for (let i = 0; i < specialists.length; i++) {
        const specialist = specialists[i];
        const imageUrl = imageUrls[i];
        
        if (!imageUrl) {
            console.log(`⏭️  Пропускаем ${specialist.name} - нет URL изображения`);
            continue;
        }
        
        // Определяем имя файла
        const filename = specialist.photo.split('/').pop();
        const filepath = path.join(IMAGES_DIR, filename);
        
        try {
            // Если URL относительный, делаем его абсолютным
            let fullUrl = imageUrl;
            if (!imageUrl.startsWith('http')) {
                const baseUrl = new URL(SOURCE_PAGE_URL);
                fullUrl = new URL(imageUrl, baseUrl.origin).href;
            }
            
            console.log(`⬇️  Загружаем: ${specialist.name}`);
            console.log(`   URL: ${fullUrl}`);
            console.log(`   Файл: ${filename}`);
            
            await downloadFile(fullUrl, filepath);
            console.log(`✅ Успешно загружено!\n`);
            
        } catch (error) {
            console.error(`❌ Ошибка загрузки для ${specialist.name}:`, error.message, '\n');
        }
    }
    
    console.log('🎉 Загрузка завершена!');
}

// Запуск
main().catch(console.error);
