const { initDatabase, prepare, saveDatabase } = require('./database');

async function addSupervisionsTable() {
    console.log('🔄 Adding supervisions table...\n');
    
    try {
        await initDatabase();
        
        // Create supervisions table
        await prepare(`
            CREATE TABLE IF NOT EXISTS supervisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                title TEXT NOT NULL,
                image TEXT,
                price INTEGER DEFAULT 0,
                duration TEXT,
                experience TEXT,
                tags TEXT,
                description TEXT,
                education TEXT,
                status TEXT DEFAULT 'available',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
        
        console.log('✅ Supervisions table created');
        
        saveDatabase();
        console.log('✅ Migration completed!\n');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    addSupervisionsTable().then(() => {
        console.log('Done!');
        process.exit(0);
    });
}

module.exports = { addSupervisionsTable };
