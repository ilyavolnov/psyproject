const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function migrate() {
    try {
        const SQL = await initSqlJs();
        
        // Load database
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);
        
        // Check if type column exists
        const tableInfo = db.exec("PRAGMA table_info(courses)");
        const hasType = tableInfo[0]?.values.some(col => col[1] === 'type');
        
        if (!hasType) {
            // Add type column
            db.run("ALTER TABLE courses ADD COLUMN type TEXT DEFAULT 'course'");
            console.log('✅ Added type column to courses table');
        } else {
            console.log('ℹ️  Type column already exists');
        }
        
        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();
        
        console.log('✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
