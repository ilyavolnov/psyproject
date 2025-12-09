// Update Care Project with actual images from New Year Care Project website
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateCourse() {
    try {
        console.log('Updating Care Project with actual images from New Year Care Project website...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // First, get the current course to preserve existing block structure
        const currentResult = db.exec("SELECT page_blocks FROM courses WHERE title = 'Проект «Забота»'");
        let existingBlocks = [];
        if (currentResult.length > 0 && currentResult[0].values.length > 0) {
            existingBlocks = JSON.parse(currentResult[0].values[0][0]);
        }

        // Update block images with new ones from the New Year Care Project website
        const updatedBlocks = existingBlocks.map(block => {
            // Ensure block and block.data exist
            if (!block || !block.data) {
                return block;
            }
            
            if (block.type === 'hero' || (block.data.title && block.data.title.includes('Проект «Забота»'))) {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        image: 'images/img-36-scaled-e1726766984247-1024x917.jpg' // Main project image from new page
                    }
                };
            } else if (block.type === 'description' || (block.data.title && block.data.title.includes('Почему проект'))) {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        image: 'images/img-39.jpg' // 'Почему проект «Забота»?' image from new page
                    }
                };
            } else {
                // For other blocks, keep the image if it was already set to the new images, otherwise update appropriately
                if (block.data.image && 
                    (block.data.image.includes('course-care-project') || 
                     block.data.image.includes('course-psychosomatic') ||
                     block.data.image.includes('rita'))) {
                    // Update other images to use one of our new images
                    const newImage = block.type === 'author' ? 'images/specialists/margarita.jpg' : 'images/img-39.jpg';
                    return {
                        ...block,
                        data: {
                            ...block.data,
                            image: newImage
                        }
                    };
                }
                return block;
            }
        });

        // Update the course with new image paths
        const query = `
            UPDATE courses
            SET image = ?, page_blocks = ?, updated_at = datetime('now')
            WHERE title = ?
        `;
        
        const result = db.run(query, [
            'images/img-36-scaled-e1726766984247-1024x917.jpg', // Main course image
            JSON.stringify(updatedBlocks),
            'Проект «Забота»'
        ]);
        
        if (result.getRowsModified() > 0) {
            console.log('✅ Care Project updated successfully with actual images from New Year Care Project website!');
        } else {
            console.log('ℹ️  No rows were updated. Course may not exist.');
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
    } catch (error) {
        console.error('❌ Failed to update course:', error);
        process.exit(1);
    }
}

updateCourse();