// Migration: Add page_blocks field to courses table
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function migrate() {
    try {
        console.log('Starting migration: Add page_blocks field to courses...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Check if column already exists
        const tableInfo = db.exec("PRAGMA table_info(courses)");
        const columns = tableInfo[0]?.values || [];
        const hasPageBlocks = columns.some(col => col[1] === 'page_blocks');

        if (!hasPageBlocks) {
            // Add page_blocks column
            db.run(`
                ALTER TABLE courses 
                ADD COLUMN page_blocks TEXT DEFAULT '[]'
            `);
            
            console.log('✅ Added page_blocks column to courses table');
            
            // Save database
            const data = db.export();
            fs.writeFileSync(dbPath, data);
        } else {
            console.log('ℹ️  page_blocks column already exists');
        }

        db.close();
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
