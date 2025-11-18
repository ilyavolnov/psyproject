// Migration to add testimonials and page_blocks fields to specialists table
const { initDatabase, prepare, saveDatabase, getDb } = require('./database');

async function addSpecialistFields() {
    console.log('🔄 Adding new fields to specialists table...');
    
    try {
        await initDatabase();
        const db = getDb();
        
        // Check if columns exist
        const tableInfo = db.exec('PRAGMA table_info(specialists)');
        const columns = tableInfo[0]?.values.map(row => row[1]) || [];
        
        console.log('Current columns:', columns);
        
        // Add testimonials column if it doesn't exist
        if (!columns.includes('testimonials')) {
            console.log('Adding testimonials column...');
            db.run('ALTER TABLE specialists ADD COLUMN testimonials TEXT');
            console.log('✅ Added testimonials column');
        } else {
            console.log('⏭️  testimonials column already exists');
        }
        
        // Add page_blocks column if it doesn't exist
        if (!columns.includes('page_blocks')) {
            console.log('Adding page_blocks column...');
            db.run('ALTER TABLE specialists ADD COLUMN page_blocks TEXT');
            console.log('✅ Added page_blocks column');
        } else {
            console.log('⏭️  page_blocks column already exists');
        }
        
        saveDatabase();
        console.log('🎉 Migration completed!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

if (require.main === module) {
    addSpecialistFields().then(() => {
        console.log('✅ Migration script finished');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = { addSpecialistFields };
