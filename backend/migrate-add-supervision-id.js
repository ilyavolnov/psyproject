const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function migrate() {
    try {
        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);
        
        // Check if supervision_id column exists
        const tableInfo = db.exec("PRAGMA table_info(requests)");
        const hasSupervisionId = tableInfo[0]?.values.some(col => col[1] === 'supervision_id');
        
        if (!hasSupervisionId) {
            db.run('ALTER TABLE requests ADD COLUMN supervision_id INTEGER');
            console.log('✅ Added supervision_id column to requests table');
        } else {
            console.log('ℹ️  supervision_id column already exists');
        }
        
        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();
        
        console.log('✅ Migration completed!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
