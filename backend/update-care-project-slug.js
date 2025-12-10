// Update slug for Care Project course
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

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

async function updateCourseSlug() {
    try {
        console.log('Updating slug for "Проект «Забота»"...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        const title = 'Проект «Забота»';
        const slug = generateSlug(title);

        // Update the course to add the slug
        const updateQuery = `
            UPDATE courses
            SET slug = ?
            WHERE title = ? AND (slug IS NULL OR slug = '')
        `;

        const result = db.run(updateQuery, [slug, title]);

        const changes = db.getRowsModified ? db.getRowsModified() : 1; // Approximate count

        if (changes > 0) {
            console.log(`✅ Slug updated for "${title}": ${slug}`);
            console.log(`✅ ${changes} record(s) updated`);
        } else {
            // Check if record already has slug
            const checkQuery = `SELECT slug FROM courses WHERE title = ?`;
            const result = db.exec(checkQuery, [title]);
            if (result.length > 0 && result[0].values.length > 0) {
                const existingSlug = result[0].values[0][0];
                if (existingSlug) {
                    console.log(`ℹ️  Course "${title}" already has slug: ${existingSlug}`);
                } else {
                    console.log(`⚠️  Found course "${title}" but slug is still empty`);
                }
            } else {
                console.log(`⚠️  Course "${title}" not found in database`);
            }
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();

        console.log('Slug update completed!');
    } catch (error) {
        console.error('❌ Failed to update slug:', error);
        process.exit(1);
    }
}

updateCourseSlug();