const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './database.sqlite';
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        request_type TEXT NOT NULL,
        message TEXT,
        specialist_id INTEGER,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);
    CREATE INDEX IF NOT EXISTS idx_specialists_status ON specialists(status);
`);

console.log('✅ Database initialized');

module.exports = db;
