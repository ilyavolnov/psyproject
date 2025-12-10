// Update slug for "Новогоднее чудо" webinar
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

async function updateWebinarSlug() {
    try {
        console.log('Updating slug for "Проект «Новогоднее чудо»"...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        const title = 'Проект «Новогоднее чудо»';
        const slug = generateSlug(title);

        // Update the webinar to add the slug
        const updateQuery = `
            UPDATE courses
            SET slug = ?
            WHERE title = ? AND (slug IS NULL OR slug = '')
        `;

        db.run(updateQuery, [slug, title]);

        // Check how many rows were affected by executing a count query
        const countQuery = `SELECT COUNT(*) as count FROM courses WHERE title = ? AND slug = ?`;
        const result = db.exec(countQuery, [title, slug]);
        const updatedCount = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 0;

        if (updatedCount > 0) {
            console.log(`✅ Slug updated for "${title}": ${slug}`);
            console.log(`✅ Records with this slug: ${updatedCount}`);
        } else {
            // Check if record already has slug
            const checkQuery = `SELECT slug FROM courses WHERE title = ?`;
            const result = db.exec(checkQuery, [title]);
            if (result.length > 0 && result[0].values.length > 0) {
                const existingSlug = result[0].values[0][0];
                if (existingSlug) {
                    console.log(`ℹ️  Webinar "${title}" already has slug: ${existingSlug}`);
                } else {
                    console.log(`⚠️  Found webinar "${title}" but slug is still empty - this is unexpected`);
                }
            } else {
                console.log(`⚠️  Webinar "${title}" not found in database`);
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

updateWebinarSlug();