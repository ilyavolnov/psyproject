// Update RPP course with start_date
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateCourse() {
    try {
        console.log('Updating RPP course with start_date...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Set start date to 7 days from now at 10:00 AM
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        futureDate.setHours(10, 0, 0, 0);
        const startDate = futureDate.toISOString().slice(0, 19);

        db.run(`
            UPDATE courses 
            SET start_date = ? 
            WHERE id = 4
        `, [startDate]);

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
        console.log('✅ RPP course updated with start_date:', startDate);
    } catch (error) {
        console.error('❌ Failed to update course:', error);
        process.exit(1);
    }
}

updateCourse();
