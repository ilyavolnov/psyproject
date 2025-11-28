const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
let db = null;
let SQL = null;

// Функция для перезагрузки БД из файла (для получения актуальных данных)
async function reloadDatabase() {
    if (!SQL) {
        SQL = await initSqlJs();
    }
    
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    return db;
}

async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            request_type TEXT NOT NULL,
            message TEXT,
            specialist_id INTEGER,
            course_id INTEGER,
            certificate_amount INTEGER,
            status TEXT DEFAULT 'new',
            archived INTEGER DEFAULT 0,
            deleted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS specialists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            photo TEXT,
            specialization TEXT,
            experience INTEGER,
            price INTEGER,
            status TEXT DEFAULT 'available',
            description TEXT,
            education TEXT,
            additional_services TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            description TEXT,
            price INTEGER,
            status TEXT DEFAULT 'available',
            image TEXT,
            release_date TEXT,
            access_duration TEXT,
            feedback_duration TEXT,
            has_certificate INTEGER DEFAULT 1,
            whatsapp_number TEXT,
            topics TEXT,
            bonuses TEXT,
            materials TEXT,
            author_name TEXT,
            author_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_archived ON requests(archived);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_deleted ON requests(deleted);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_specialists_status ON specialists(status);`);
    
    // Check if supervision_id column exists in requests
    try {
        const requestsInfo = db.exec("PRAGMA table_info(requests)");
        const hasSupervisionId = requestsInfo[0]?.values.some(col => col[1] === 'supervision_id');
        if (!hasSupervisionId) {
            db.run('ALTER TABLE requests ADD COLUMN supervision_id INTEGER');
            console.log('✅ Added supervision_id column to requests table');
        }
    } catch (error) {
        console.log('ℹ️  Requests migration check:', error.message);
    }

    // Run migrations
    try {
        // Check if slug column exists in courses table
        const tableInfo = db.exec("PRAGMA table_info(courses)");
        const hasSlug = tableInfo[0]?.values.some(col => col[1] === 'slug');
        
        if (!hasSlug) {
            db.run('ALTER TABLE courses ADD COLUMN slug TEXT');
            console.log('✅ Added slug column to courses table');
        }
        
        // Check if page_blocks column exists
        const hasPageBlocks = tableInfo[0]?.values.some(col => col[1] === 'page_blocks');
        if (!hasPageBlocks) {
            db.run('ALTER TABLE courses ADD COLUMN page_blocks TEXT');
            console.log('✅ Added page_blocks column to courses table');
        }
        
        // Check if start_date column exists
        const hasStartDate = tableInfo[0]?.values.some(col => col[1] === 'start_date');
        if (!hasStartDate) {
            db.run('ALTER TABLE courses ADD COLUMN start_date TEXT');
            console.log('✅ Added start_date column to courses table');
        }
        
        // Check if type column exists
        const hasType = tableInfo[0]?.values.some(col => col[1] === 'type');
        if (!hasType) {
            db.run("ALTER TABLE courses ADD COLUMN type TEXT DEFAULT 'course'");
            console.log('✅ Added type column to courses table');
        }
    } catch (error) {
        console.log('ℹ️  Migration check:', error.message);
    }

    // Initialize default settings
    const existingSettings = db.exec('SELECT COUNT(*) as count FROM settings');
    if (!existingSettings.length || existingSettings[0].values[0][0] === 0) {
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('telegram_enabled', 'false')`);
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('telegram_bot_token', '')`);
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('telegram_admin_id', '')`);
    }

    console.log('✅ Database initialized');
    
    // Save database to file
    saveDatabase();
    
    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// Helper functions to match better-sqlite3 API
function prepare(sql) {
    return {
        run: async (...params) => {
            await reloadDatabase(); // Перезагружаем БД перед записью
            if (!db) {
                throw new Error('Database not initialized');
            }
            db.run(sql, params);
            saveDatabase();
            return { changes: db.getRowsModified(), lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
        },
        get: async (...params) => {
            await reloadDatabase(); // Перезагружаем БД перед чтением
            if (!db) {
                throw new Error('Database not initialized');
            }
            const result = db.exec(sql, params);
            if (result.length > 0 && result[0].values.length > 0) {
                const columns = result[0].columns;
                const values = result[0].values[0];
                const row = {};
                columns.forEach((col, i) => row[col] = values[i]);
                return row;
            }
            return undefined;
        },
        all: async (...params) => {
            try {
                await reloadDatabase(); // Перезагружаем БД перед чтением
                if (!db) {
                    console.error('Database not initialized in prepare().all()');
                    return [];
                }
                
                const result = db.exec(sql, params);
                
                if (result.length > 0 && result[0].values && result[0].values.length > 0) {
                    const columns = result[0].columns;
                    const rows = result[0].values.map(values => {
                        const row = {};
                        columns.forEach((col, i) => row[col] = values[i]);
                        return row;
                    });
                    return rows;
                }
                return []; // Всегда возвращаем массив
            } catch (error) {
                console.error('Error in prepare().all():', error);
                return []; // Возвращаем пустой массив при ошибке
            }
        }
    };
}

module.exports = {
    initDatabase,
    getDb: () => db,
    prepare,
    saveDatabase,
    reloadDatabase
};
