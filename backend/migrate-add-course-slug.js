const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

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

db.serialize(() => {
    // Add slug column
    db.run(`ALTER TABLE courses ADD COLUMN slug TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding slug column:', err);
            return;
        }
        console.log('✅ Added slug column to courses table');
    });

    // Generate slugs for existing courses
    db.all('SELECT id, title FROM courses', (err, courses) => {
        if (err) {
            console.error('Error fetching courses:', err);
            return;
        }

        const stmt = db.prepare('UPDATE courses SET slug = ? WHERE id = ?');
        
        courses.forEach(course => {
            const slug = generateSlug(course.title);
            stmt.run(slug, course.id);
            console.log(`✅ Generated slug for "${course.title}": ${slug}`);
        });
        
        stmt.finalize();
        
        console.log('\n✅ Migration completed successfully!');
        console.log(`Updated ${courses.length} courses with slugs`);
        
        db.close();
    });
});
