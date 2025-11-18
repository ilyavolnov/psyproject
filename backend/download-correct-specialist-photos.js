const https = require('https');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'specialists');
const BASE_URL = 'https://dr-rumyantceva.ru/specialists/';

// Маппинг имен специалистов к их slug на сайте
const SPECIALIST_SLUGS = {
    'Маргарита Румянцева': 'margarita-rumyanczeva',
    'Ольга П.': 'olga-p',
    'Анна Б.': 'anna-b',
    'Анастасия': 'anastasiya',
    'Марина': 'marina',
    'Ольга': 'olga',
    'Ульяна': 'ulyana',
    'Юлия С.': 'yuliya-s',
    'Павел': 'pavel',
    'Владимир': 'vladimir',
    'Анастасия П.': 'anastasiya-p',
    'Мария Р.': 'mariya-r',
    'Вера': 'vera',
    'Марина М.': 'marina-m',
    'Анна Ж.': 'anna-zh',
    'Наталья': 'natalya',
    'Надежда Л.': 'nadezhda-l',
    'Надежда': 'nadezhda',
    'Элеонора': 'eleonora',
    'Елена К.': 'elena-k',
    'Елена': 'elena',
    'Мария': 'mariya',
    'Елена Ч.': 'elena-ch',
    'Инесса': 'inessa',
    'Наталья Г.': 'natalya-g',
    'Елизавета': 'elizaveta',
    'Мария С.': 'mariya-s',
    'Наталья С.': 'natalya-s',
    'Анна С.': 'anna-s',
    'Наталья Я.': 'natalya-ya',
    'Наталья Ш.': 'natalya-sh',
    'Анастасия Б.': 'anastasiya-b',
    'Екатерина М.': 'ekaterina-m',
    'Екатерина': 'ekaterina',
    'Динара': 'dinara',
    'Елена В.': 'elena-v',
    'Анна': 'anna',
    'Евгения': 'evgeniya',
    'Юлия': 'yuliya',
    'Валерия': 'valeriya',
    'Татьяна': 'tatyana',
    'Маргарита М.': 'margarita-m'
};

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            let html = '';
            response.on('data', chunk => html += chunk);
            response.on('end', () => resolve(html));
            response.on('error', reject);
        }).on('error', reject);
    });
}

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

function extractPhotoUrl(html) {
    // Ищем главное фото специалиста
    // Обычно это первое большое изображение на странице
    
    // Вариант 1: Фото в блоке specialistPage__img
    let match = html.match(/<img[^>]*class="[^"]*specialistPage__img[^"]*"[^>]*src="([^"]+)"/i);
    if (match) return match[1];
    
    // Вариант 2: Первое изображение в контенте
    match = html.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
    if (match) {
        const url = match[1];
        // Фильтруем служебные изображения
        if (!url.includes('payment') && !url.includes('icon') && !url.includes('logo')) {
            return url;
        }
    }
    
    // Вариант 3: Ищем в data-атрибутах
    match = html.match(/data-src="([^"]+\.(?:jpg|jpeg|png|webp))"/i);
    if (match) return match[1];
    
    return null;
}

function makeAbsoluteUrl(url) {
    if (url.startsWith('http')) {
        return url;
    }
    if (url.startsWith('//')) {
        return 'https:' + url;
    }
    if (url.startsWith('/')) {
        return 'https://dr-rumyantceva.ru' + url;
    }
    return 'https://dr-rumyantceva.ru/' + url;
}

function generateFilename(name, id) {
    const normalized = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zа-я0-9_]/g, '')
        .replace(/_+/g, '_');
    
    return `specialist_${id}_${normalized}_correct.jpg`;
}

async function main() {
    console.log('🚀 Автоматическая загрузка правильных фотографий\n');
    console.log('='.repeat(70));
    
    let db;
    
    try {
        // Инициализируем БД
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к БД\n');
        
        // Получаем специалистов
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
        
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        
        for (const specialist of specialists) {
            const slug = SPECIALIST_SLUGS[specialist.name];
            
            console.log(`\n[${specialist.id}] ${specialist.name}`);
            console.log('-'.repeat(70));
            
            if (!slug) {
                console.log('⏭️  Slug не найден, пропускаем');
                skippedCount++;
                continue;
            }
            
            const pageUrl = `${BASE_URL}${slug}/`;
            
            try {
                console.log(`⬇️  Загрузка страницы: ${pageUrl}`);
                
                const html = await fetchPage(pageUrl);
                const photoUrl = extractPhotoUrl(html);
                
                if (!photoUrl) {
                    console.log('⚠️  Фото не найдено на странице');
                    errorCount++;
                    continue;
                }
                
                const absoluteUrl = makeAbsoluteUrl(photoUrl);
                console.log(`📸 Найдено фото: ${absoluteUrl.substring(0, 60)}...`);
                
                // Генерируем имя файла
                const filename = generateFilename(specialist.name, specialist.id);
                const filepath = path.join(IMAGES_DIR, filename);
                
                // Проверяем существование
                if (fs.existsSync(filepath)) {
                    console.log(`ℹ️  Файл уже существует: ${filename}`);
                    
                    // Обновляем путь в БД если отличается
                    const newPath = `images/specialists/${filename}`;
                    if (specialist.photo !== newPath) {
                        db.run('UPDATE specialists SET photo = ? WHERE id = ?', [newPath, specialist.id]);
                        console.log(`📝 Обновлен путь в БД`);
                    }
                    
                    successCount++;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    continue;
                }
                
                // Скачиваем фото
                console.log(`💾 Сохранение: ${filename}`);
                await downloadImage(absoluteUrl, filepath);
                
                const stats = fs.statSync(filepath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`✅ Загружено: ${sizeKB} KB`);
                
                // Обновляем в БД
                const newPath = `images/specialists/${filename}`;
                db.run('UPDATE specialists SET photo = ? WHERE id = ?', [newPath, specialist.id]);
                console.log(`📝 Обновлен путь в БД: ${newPath}`);
                
                successCount++;
                
                // Задержка между запросами
                await new Promise(resolve => setTimeout(resolve, 500));
                
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
        console.log(`   ✅ Успешно: ${successCount}`);
        console.log(`   ❌ Ошибок: ${errorCount}`);
        console.log(`   ⏭️  Пропущено: ${skippedCount}`);
        console.log(`   📁 Директория: ${IMAGES_DIR}`);
        console.log('='.repeat(70) + '\n');
        
        if (successCount > 0) {
            console.log('🎉 Правильные фотографии загружены!');
            console.log('💾 Изменения сохранены в БД\n');
        }
        
        db.close();
        
    } catch (error) {
        console.error('\n❌ Критическая ошибка:', error);
        if (db) db.close();
        process.exit(1);
    }
}

main();
