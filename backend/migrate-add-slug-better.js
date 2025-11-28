const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

// Function to generate slug from title
function generateSlug(title) {
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return title
        .toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function migrate() {
    try {
        const SQL = await initSqlJs();
        
        // Load database
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);
        
        // Check if slug column exists
        const tableInfo = db.exec("PRAGMA table_info(courses)");
        const hasSlug = tableInfo[0]?.values.some(col => col[1] === 'slug');
        
        if (!hasSlug) {
            // Add slug column
            db.run('ALTER TABLE courses ADD COLUMN slug TEXT');
            console.log('✅ Added slug column to courses table');
        } else {
            console.log('ℹ️  Slug column already exists');
        }

        // Generate slugs for existing courses
        const result = db.exec('SELECT id, title, slug FROM courses');
        
        if (result.length > 0) {
            const courses = result[0].values.map(row => ({
                id: row[0],
                title: row[1],
                slug: row[2]
            }));
            
            let updated = 0;
            courses.forEach(course => {
                if (!course.slug) {
                    const slug = generateSlug(course.title);
                    db.run('UPDATE courses SET slug = ? WHERE id = ?', [slug, course.id]);
                    console.log(`✅ Generated slug for "${course.title}": ${slug}`);
                    updated++;
                }
            });
            
            console.log(`\n✅ Migration completed successfully!`);
            console.log(`Updated ${updated} courses with slugs`);
        }
        
        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
