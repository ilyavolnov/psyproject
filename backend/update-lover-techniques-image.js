// Update image path for "Интенсив «5 техник хорошей любовницы»"
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateImagePath() {
    try {
        console.log('Updating image path for "Интенсив «5 техник хорошей любовницы»"...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Update the image path from webinars subfolder to main images folder
        const updateQuery = `
            UPDATE courses
            SET image = 'images/lover-techniques.jpg',
                page_blocks = json_replace(page_blocks, 
                    json_extract(page_blocks, '$[0].data.image'), 
                    'images/lover-techniques.jpg')
            WHERE title LIKE '%5 техник хорошей любовницы%'
        `;

        // Alternative approach: update step by step since json functions might not be available in sql.js
        // Let's first select the current page_blocks to modify it properly
        
        // First get the current page_blocks
        const selectQuery = `SELECT id, page_blocks FROM courses WHERE title LIKE '%5 техник хорошей любовницы%'`;
        const results = db.exec(selectQuery);
        
        if (results.length > 0 && results[0].values.length > 0) {
            for (const row of results[0].values) {
                const id = row[0];
                const currentBlocks = JSON.parse(row[1]);
                
                // Update the image in the hero block
                if (currentBlocks && Array.isArray(currentBlocks)) {
                    const heroBlock = currentBlocks.find(block => block.type === 'hero');
                    if (heroBlock && heroBlock.data) {
                        heroBlock.data.image = 'images/lover-techniques.jpg';
                    }
                }
                
                // Update the image in the description block if needed
                const descBlock = currentBlocks.find(block => block.type === 'description');
                if (descBlock && descBlock.data && descBlock.data.image && descBlock.data.image.includes('webinars/')) {
                    descBlock.data.image = 'images/lover-techniques.jpg';
                }
                
                // Update the features block if needed
                const featuresBlock = currentBlocks.find(block => block.type === 'features');
                if (featuresBlock && featuresBlock.data && featuresBlock.data.image && featuresBlock.data.image.includes('webinars/')) {
                    featuresBlock.data.image = 'images/lover-techniques.jpg';
                }
                
                // Update the record
                const updateQuery = `UPDATE courses SET image = ?, page_blocks = ? WHERE id = ?`;
                db.run(updateQuery, [
                    'images/lover-techniques.jpg',
                    JSON.stringify(currentBlocks),
                    id
                ]);
                
                console.log(`✅ Updated image path for course ID ${id}`);
            }
        } else {
            console.log('⚠️  Course "Интенсив «5 техник хорошей любовницы»" not found in database');
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);
        db.close();

        console.log('Image path update completed!');
    } catch (error) {
        console.error('❌ Failed to update image path:', error);
        process.exit(1);
    }
}

updateImagePath();