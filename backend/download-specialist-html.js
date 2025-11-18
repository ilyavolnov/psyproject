const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://dr-rumyantceva.ru/specialists/';

// Список известных URL специалистов (из структуры сайта)
const SPECIALIST_SLUGS = [
    'margarita-rumyanczeva',
    'olga-p',
    'anna-b',
    'anastasiya',
    'marina',
    'olga',
    'ulyana',
    'yuliya-s',
    'pavel',
    'vladimir',
    'anastasiya-p',
    'mariya-r',
    'vera',
    'marina-m',
    'anna-zh',
    'natalya',
    'nadezhda-l',
    'nadezhda',
    'eleonora',
    'elena-k',
    'elena',
    'mariya',
    'elena-ch',
    'inessa',
    'natalya-g',
    'elizaveta',
    'mariya-s',
    'natalya-s',
    'anna-s',
    'natalya-ya',
    'natalya-sh',
    'anastasiya-b',
    'ekaterina-m',
    'ekaterina',
    'dinara',
    'elena-v',
    'anna',
    'evgeniya',
    'yuliya',
    'valeriya',
    'tatyana',
    'margarita-m'
];

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

async function main() {
    console.log('🚀 Загрузка HTML страниц специалистов\n');
    
    // Создаем директорию для HTML
    const htmlDir = path.join(__dirname, '..', 'temp-specialist-html');
    if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true });
    }
    
    // Загружаем первую страницу для примера
    const testSlug = 'margarita-rumyanczeva';
    const testUrl = `${BASE_URL}${testSlug}/`;
    
    console.log(`⬇️  Загрузка: ${testUrl}`);
    
    try {
        const html = await fetchPage(testUrl);
        const filepath = path.join(htmlDir, `${testSlug}.html`);
        fs.writeFileSync(filepath, html, 'utf8');
        
        console.log(`✅ Сохранено: ${filepath}`);
        console.log(`📏 Размер: ${(html.length / 1024).toFixed(2)} KB\n`);
        
        // Анализируем структуру
        console.log('🔍 Анализ структуры HTML:\n');
        
        // Ищем основные блоки
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        console.log('H1:', h1Match ? h1Match[1].replace(/<[^>]+>/g, '') : 'не найден');
        
        const h2Matches = html.match(/<h2[^>]*>.*?<\/h2>/gi);
        console.log('H2 заголовков:', h2Matches ? h2Matches.length : 0);
        
        const h3Matches = html.match(/<h3[^>]*>.*?<\/h3>/gi);
        console.log('H3 заголовков:', h3Matches ? h3Matches.length : 0);
        
        // Ищем классы контейнеров
        const classMatches = html.match(/class="([^"]*)"/g);
        if (classMatches) {
            const classes = new Set();
            classMatches.forEach(m => {
                const cls = m.match(/class="([^"]*)"/)[1];
                cls.split(' ').forEach(c => {
                    if (c.includes('content') || c.includes('block') || c.includes('section')) {
                        classes.add(c);
                    }
                });
            });
            console.log('\nКлассы контента:', Array.from(classes).slice(0, 10).join(', '));
        }
        
        console.log('\n✅ Проверьте файл для анализа структуры');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

main();
