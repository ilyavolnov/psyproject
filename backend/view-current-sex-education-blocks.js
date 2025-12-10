// View current page blocks for the sex education webinar
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function viewCurrentBlocks() {
    try {
        console.log('Viewing current page blocks for "Половое воспитание детей"...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Get the webinar with this title
        const selectQuery = `SELECT page_blocks FROM courses WHERE title LIKE '%Половое воспитание детей%'`;
        const results = db.exec(selectQuery);
        
        if (results.length > 0 && results[0].values.length > 0) {
            const pageBlocks = results[0].values[0][0];
            
            console.log('\nCurrent page blocks:');
            console.log(JSON.stringify(JSON.parse(pageBlocks), null, 2));
        } else {
            console.log('No webinar found with title containing "Половое воспитание детей"');
        }

        db.close();
        console.log('\nView completed!');
    } catch (error) {
        console.error('❌ Failed to view blocks:', error);
        process.exit(1);
    }
}

viewCurrentBlocks();