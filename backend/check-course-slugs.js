// Check courses slugs in database
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function checkCourses() {
    try {
        console.log('Checking courses slugs...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        const selectQuery = `SELECT id, title, slug FROM courses ORDER BY title`;
        const results = db.exec(selectQuery);
        
        if (results.length > 0 && results[0].values.length > 0) {
            console.log(`\nFound ${results[0].values.length} courses in database:`);
            console.log('ID\t| Title\t\t\t\t\t| Slug');
            console.log('-'.repeat(80));
            
            for (const row of results[0].values) {
                const id = row[0];
                const title = row[1];
                const slug = row[2];
                
                const status = slug ? '✅' : '❌ NO SLUG';
                console.log(`${id}\t| ${title.substring(0, 30).padEnd(30)}\t| ${slug || 'NULL'} ${status}`);
            }
            
            // Count courses without slugs
            const noSlugQuery = `SELECT COUNT(*) as count FROM courses WHERE slug IS NULL OR slug = ''`;
            const noSlugResults = db.exec(noSlugQuery);
            const noSlugCount = noSlugResults[0]?.values[0][0] || 0;
            
            console.log(`\nCourses without slug: ${noSlugCount}`);
            
            if (noSlugCount > 0) {
                console.log('\nCourses without slug:');
                const noSlugSelectQuery = `SELECT id, title FROM courses WHERE slug IS NULL OR slug = ''`;
                const noSlugCourses = db.exec(noSlugSelectQuery);
                
                for (const row of noSlugCourses[0]?.values || []) {
                    console.log(`  - ID ${row[0]}: ${row[1]}`);
                }
            }
        } else {
            console.log('No courses found in database');
        }

        db.close();
        console.log('\nCourse check completed!');
    } catch (error) {
        console.error('❌ Failed to check courses:', error);
        process.exit(1);
    }
}

checkCourses();