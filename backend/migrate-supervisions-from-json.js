const fs = require('fs');
const path = require('path');
const { initDatabase, prepare, saveDatabase } = require('./database');

async function migrateSupervisions() {
    console.log('🔄 Migrating supervisions from JSON to database...\n');
    
    try {
        await initDatabase();
        
        // Read JSON file
        const jsonPath = path.join(__dirname, '..', 'supervisions-data.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`📋 Found ${jsonData.supervisions.length} supervisions\n`);
        
        // Clear existing data
        await prepare('DELETE FROM supervisions').run();
        console.log('🗑️  Cleared existing supervisions\n');
        
        // Insert supervisions
        const insertQuery = `
            INSERT INTO supervisions (
                name, title, image, price, duration, experience,
                tags, description, education, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const supervision of jsonData.supervisions) {
            await prepare(insertQuery).run(
                supervision.name,
                supervision.title,
                supervision.image || '',
                supervision.price || 0,
                supervision.duration || '',
                supervision.experience || '',
                JSON.stringify(supervision.tags || []),
                JSON.stringify(supervision.description || []),
                JSON.stringify(supervision.education || []),
                'available'
            );
            
            console.log(`✅ Migrated: ${supervision.name}`);
        }
        
        saveDatabase();
        
        // Verify
        const count = await prepare('SELECT COUNT(*) as count FROM supervisions').get();
        console.log(`\n🎉 Migration completed! ${count.count} supervisions in database`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    migrateSupervisions().then(() => {
        console.log('\nDone!');
        process.exit(0);
    });
}

module.exports = { migrateSupervisions };
