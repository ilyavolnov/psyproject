// Migration script to import specialists from JSON to database
const fs = require('fs');
const path = require('path');
const { initDatabase, prepare, saveDatabase } = require('./database');

async function migrateSpecialists() {
    console.log('🔄 Starting specialists migration...');
    
    try {
        // Initialize database
        await initDatabase();
        
        // Read specialists-data.json
        const jsonPath = path.join(__dirname, '../specialists-data.json');
        
        if (!fs.existsSync(jsonPath)) {
            console.log('❌ specialists-data.json not found');
            return;
        }
        
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(jsonData);
        
        if (!data.specialists || !Array.isArray(data.specialists)) {
            console.log('❌ Invalid specialists data structure');
            return;
        }
        
        console.log(`👥 Found ${data.specialists.length} specialists to migrate`);
        
        // Clear existing specialists
        prepare('DELETE FROM specialists').run();
        console.log('🗑️ Cleared existing specialists');
        
        // Insert specialists
        const insertQuery = `
            INSERT INTO specialists (
                name, photo, specialization, experience, price, status,
                description, education, additional_services
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertStmt = prepare(insertQuery);
        
        data.specialists.forEach((specialist, index) => {
            try {
                // Prepare data
                const specialization = specialist.role || specialist.specializations?.join(', ') || '';
                const description = specialist.therapyMethods ? 
                    'Методы терапии:\n' + specialist.therapyMethods.join('\n') : '';
                const education = Array.isArray(specialist.education) ? 
                    specialist.education.join('\n\n') : (specialist.education || '');
                const additionalServices = specialist.additionalServices || '';
                
                insertStmt.run(
                    specialist.name || 'Без имени',
                    specialist.photo || '',
                    specialization,
                    specialist.experience || 0,
                    specialist.price || 0,
                    specialist.status || 'available',
                    description,
                    education,
                    additionalServices
                );
                
                console.log(`✅ Migrated: ${specialist.name}`);
            } catch (error) {
                console.error(`❌ Error migrating specialist ${index + 1}:`, error.message);
            }
        });
        
        saveDatabase();
        
        // Verify migration
        const count = prepare('SELECT COUNT(*) as count FROM specialists').get();
        console.log(`🎉 Migration completed! ${count.count} specialists in database`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateSpecialists().then(() => {
        console.log('✅ Migration script finished');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = { migrateSpecialists };
