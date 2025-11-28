const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function migrate() {
    try {
        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);
        
        // Create payments table
        db.run(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id TEXT,
                order_id TEXT UNIQUE,
                amount INTEGER,
                status TEXT DEFAULT 'pending',
                client_email TEXT,
                client_phone TEXT,
                service_name TEXT,
                course_id INTEGER,
                supervision_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                paid_at DATETIME
            )
        `);
        
        console.log('✅ Payments table created');
        
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
