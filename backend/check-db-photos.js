const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    
    console.log('📊 Статистика фотографий в БД:\n');
    
    // Всего специалистов
    const total = db.exec('SELECT COUNT(*) as count FROM specialists');
    console.log(`Всего специалистов: ${total[0].values[0][0]}`);
    
    // С hero-page.webp
    const heroPage = db.exec('SELECT COUNT(*) as count FROM specialists WHERE photo LIKE "%hero-page%"');
    console.log(`С hero-page.webp: ${heroPage[0].values[0][0]}`);
    
    // С specialist_ фото
    const specialist = db.exec('SELECT COUNT(*) as count FROM specialists WHERE photo LIKE "%specialist_%"');
    console.log(`С specialist_: ${specialist[0].values[0][0]}`);
    
    // Примеры
    console.log('\n📋 Примеры (первые 5):');
    const examples = db.exec('SELECT id, name, photo FROM specialists LIMIT 5');
    examples[0].values.forEach(row => {
        console.log(`  [${row[0]}] ${row[1]}: ${row[2]}`);
    });
    
    db.close();
})();
