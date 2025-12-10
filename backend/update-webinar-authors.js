// Update author photo for all webinars to Margarita Rumyantseva's image
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateWebinarAuthors() {
    try {
        console.log('Updating author photo for all webinars...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Get all webinars
        const selectQuery = `SELECT id, title, page_blocks FROM courses WHERE type = 'webinar'`;
        const results = db.exec(selectQuery);
        
        if (results.length > 0 && results[0].values.length > 0) {
            console.log(`Found ${results[0].values.length} webinars to update`);
            
            for (const row of results[0].values) {
                const id = row[0];
                const title = row[1];
                const currentBlocks = JSON.parse(row[2]);
                
                console.log(`Processing webinar: ${title} (ID: ${id})`);
                
                // Find and update the author block
                if (currentBlocks && Array.isArray(currentBlocks)) {
                    const authorBlock = currentBlocks.find(block => block.type === 'author');
                    
                    if (authorBlock && authorBlock.data) {
                        // Update the photo to Margarita's image
                        authorBlock.data.photo = 'images/specialists/margarita.jpg';
                        
                        // Make sure the author name is correct
                        authorBlock.data.name = 'Маргарита Румянцева';
                        
                        // Update the record
                        const updateQuery = `UPDATE courses SET page_blocks = ? WHERE id = ?`;
                        db.run(updateQuery, [JSON.stringify(currentBlocks), id]);
                        
                        console.log(`  ✅ Updated author photo for "${title}"`);
                    } else {
                        // If no author block exists, we might want to add one, but for now just log
                        console.log(`  ⚠️  No author block found for "${title}"`);
                    }
                }
            }
        } else {
            console.log('No webinars found in database');
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();

        console.log('All webinar author photos updated successfully!');
    } catch (error) {
        console.error('❌ Failed to update webinar author photos:', error);
        process.exit(1);
    }
}

updateWebinarAuthors();