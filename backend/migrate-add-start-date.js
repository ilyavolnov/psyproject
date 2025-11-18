// Migration: Add start_date field to courses table
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function migrate() {
    try {
        console.log('Starting migration: Add start_date field to courses...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Check if column already exists
        const tableInfo = db.exec("PRAGMA table_info(courses)");
        const columns = tableInfo[0]?.values || [];
        const hasStartDate = columns.some(col => col[1] === 'start_date');

        if (!hasStartDate) {
            // Add start_date column
            db.run(`
                ALTER TABLE courses 
                ADD COLUMN start_date TEXT
            `);
            
            console.log('✅ Added start_date column to courses table');
            
            // Save database
            const data = db.export();
            fs.writeFileSync(dbPath, data);
        } else {
            console.log('ℹ️  start_date column already exists');
        }

        db.close();
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
