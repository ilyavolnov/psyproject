// Migration script to import courses from JSON to database
const fs = require('fs');
const path = require('path');
const { initDatabase, prepare, saveDatabase } = require('./database');

async function migrateCourses() {
    console.log('🔄 Starting courses migration...');
    
    try {
        // Initialize database
        await initDatabase();
        
        // Read courses-data.json
        const jsonPath = path.join(__dirname, '../courses-data.json');
        
        if (!fs.existsSync(jsonPath)) {
            console.log('❌ courses-data.json not found');
            return;
        }
        
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(jsonData);
        
        if (!data.courses || !Array.isArray(data.courses)) {
            console.log('❌ Invalid courses data structure');
            return;
        }
        
        console.log(`📚 Found ${data.courses.length} courses to migrate`);
        
        // Clear existing courses
        prepare('DELETE FROM courses').run();
        console.log('🗑️ Cleared existing courses');
        
        // Insert courses
        const insertQuery = `
            INSERT INTO courses (
                title, subtitle, description, price, status, image,
                release_date, access_duration, feedback_duration,
                has_certificate, whatsapp_number, topics,
                author_name, author_description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertStmt = prepare(insertQuery);
        
        data.courses.forEach((course, index) => {
            try {
                // Map JSON structure to database structure
                const topics = course.topics ? course.topics.map(t => 
                    typeof t === 'string' ? t : t.title || t.name || ''
                ).filter(t => t) : [];
                
                insertStmt.run(
                    course.title || 'Без названия',
                    course.subtitle || course.description || '',
                    course.fullDescription || course.description || '',
                    course.price || 0,
                    course.status || 'available',
                    course.image || '',
                    course.releaseDate || course.startDate || '',
                    course.accessDuration || '3 недели',
                    course.feedbackDuration || 'Индивидуальное сопровождение',
                    course.hasCertificate ? 1 : 0,
                    course.whatsappNumber || '89211880755',
                    JSON.stringify(topics),
                    course.authorName || 'Маргарита Румянцева',
                    course.authorDescription || 'Врач-психиатр, психотерапевт, сексолог'
                );
                
                console.log(`✅ Migrated: ${course.title}`);
            } catch (error) {
                console.error(`❌ Error migrating course ${index + 1}:`, error.message);
            }
        });
        
        saveDatabase();
        
        // Verify migration
        const count = prepare('SELECT COUNT(*) as count FROM courses').get();
        console.log(`🎉 Migration completed! ${count.count} courses in database`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateCourses().then(() => {
        console.log('✅ Migration script finished');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = { migrateCourses };
