// Update slugs for all courses without slugs
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

async function updateAllCourseSlugs() {
    try {
        console.log('Updating slugs for all courses without slugs...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Get all courses without slugs
        const selectQuery = `SELECT id, title FROM courses WHERE slug IS NULL OR slug = ''`;
        const results = db.exec(selectQuery);
        
        if (results.length > 0 && results[0].values.length > 0) {
            console.log(`\nFound ${results[0].values.length} courses without slugs:`);
            
            for (const row of results[0].values) {
                const id = row[0];
                const title = row[1];
                const slug = generateSlug(title);

                // Update the course to add the slug
                const updateQuery = `UPDATE courses SET slug = ? WHERE id = ?`;
                db.run(updateQuery, [slug, id]);

                console.log(`✅ Updated course ID ${id}: "${title}" -> slug: "${slug}"`);
            }
            
            console.log(`\n✅ Successfully updated slugs for ${results[0].values.length} courses!`);
        } else {
            console.log('All courses already have slugs!');
        }

        // Also ensure courses that have slugs but with Cyrillic characters are properly transliterated
        const cyrillicSlugQuery = `SELECT id, title, slug FROM courses WHERE slug GLOB '*[а-яА-ЯёЁ]*' AND title != 'slug'`;
        const cyrillicResults = db.exec(cyrillicSlugQuery);
        
        if (cyrillicResults.length > 0 && cyrillicResults[0].values.length > 0) {
            console.log(`\nFound ${cyrillicResults[0].values.length} courses with Cyrillic characters in slug, updating:`);
            
            for (const row of cyrillicResults[0].values) {
                const id = row[0];
                const title = row[1];
                const currentSlug = row[2];
                const newSlug = generateSlug(title);

                if (currentSlug !== newSlug) {
                    // Update the course slug
                    const updateQuery = `UPDATE courses SET slug = ? WHERE id = ?`;
                    db.run(updateQuery, [newSlug, id]);

                    console.log(`🔄 Updated course ID ${id}: "${currentSlug}" -> "${newSlug}"`);
                }
            }
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();

        console.log('\nAll course slugs updated successfully!');
    } catch (error) {
        console.error('❌ Failed to update course slugs:', error);
        process.exit(1);
    }
}

updateAllCourseSlugs();