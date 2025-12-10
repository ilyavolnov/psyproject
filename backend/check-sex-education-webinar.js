// Check if 'Половое воспитание детей' webinar exists in database
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function checkWebinar() {
    try {
        console.log('Checking for "Половое воспитание детей" webinar...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Check for webinar with this title
        const selectQuery = `SELECT * FROM courses WHERE title LIKE '%Половое воспитание детей%'`;
        const results = db.exec(selectQuery);
        
        if (results.length > 0 && results[0].values.length > 0) {
            console.log(`\nFound ${results[0].values.length} webinar(s) with title containing "Половое воспитание детей":`);
            
            const columns = results[0].columns;
            console.log('Columns:', columns);
            
            for (const row of results[0].values) {
                const course = {};
                columns.forEach((col, i) => course[col] = row[i]);
                
                console.log('\nFound webinar:');
                console.log('ID:', course.id);
                console.log('Title:', course.title);
                console.log('Price:', course.price);
                console.log('Status:', course.status);
                console.log('Type:', course.type);
                console.log('Slug:', course.slug);
                console.log('Page blocks exist:', !!course.page_blocks);
                console.log('First 100 chars of page_blocks:', course.page_blocks ? course.page_blocks.substring(0, 100) : 'NULL');
            }
        } else {
            console.log('No webinar found with title containing "Половое воспитание детей"');
            
            // Let's check for similar titles
            const similarQuery = `SELECT id, title, price, type FROM courses WHERE title LIKE '%воспитание%' OR title LIKE '%дет%' OR title LIKE '%sex%' OR title LIKE '%sex%'`;
            const similarResults = db.exec(similarQuery);
            
            if (similarResults.length > 0 && similarResults[0].values.length > 0) {
                console.log('\nFound similar titles:');
                for (const row of similarResults[0].values) {
                    console.log(`  ID ${row[0]}: ${row[1]} (Price: ${row[2]}, Type: ${row[3]})`);
                }
            }
        }

        db.close();
        console.log('\nCheck completed!');
    } catch (error) {
        console.error('❌ Failed to check webinar:', error);
        process.exit(1);
    }
}

checkWebinar();