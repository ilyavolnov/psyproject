// Initialize Database Schema
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'requests.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
    // Requests table
    db.run(`
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            request_type TEXT NOT NULL,
            specialist_id INTEGER,
            message TEXT,
            course_id INTEGER,
            certificate_amount INTEGER,
            status TEXT DEFAULT 'new',
            archived INTEGER DEFAULT 0,
            deleted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert sample data
    const sampleRequests = [
        ['Анна Иванова', '+7 (999) 123-45-67', 'anna@example.com', 'consultation', 1, 'Хочу записаться на консультацию по вопросам тревожности', null, null, 'new'],
        ['Петр Сидоров', '+7 (999) 234-56-78', 'petr@example.com', 'course', null, 'Интересует курс по РПП', 1, null, 'pending'],
        ['Мария Петрова', '+7 (999) 345-67-89', 'maria@example.com', 'certificate', null, 'Хочу купить сертификат на 5000₽ в подарок', null, 5000, 'new'],
        ['Иван Козлов', '+7 (999) 456-78-90', 'ivan@example.com', 'supervision', 28, 'Нужна супервизия по сложному случаю', null, null, 'completed'],
        ['Елена Смирнова', '+7 (999) 567-89-01', 'elena@example.com', 'specialist', 2, 'Хочу записаться к Ольге П.', null, null, 'pending'],
        ['Дмитрий Волков', '+7 (999) 678-90-12', 'dmitry@example.com', 'course', null, 'Оплатил курс Цунами', 3, null, 'completed'],
        ['Ольга Новикова', '+7 (999) 789-01-23', 'olga@example.com', 'specialist', 3, 'Хочу записаться к Анне Б. на консультацию', null, null, 'new'],
        ['Сергей Морозов', '+7 (999) 890-12-34', 'sergey@example.com', 'certificate', null, 'Покупка сертификата на 10000₽', null, 10000, 'pending'],
        ['Татьяна Белова', '+7 (999) 901-23-45', 'tatiana@example.com', 'consultation', 1, 'Первичная консультация', null, null, 'new'],
        ['Алексей Орлов', '+7 (999) 012-34-56', 'alexey@example.com', 'specialist', 5, 'Семейная консультация', null, null, 'completed'],
    ];

    const insertStmt = db.prepare(`
        INSERT INTO requests (
            name, phone, email, request_type, specialist_id,
            message, course_id, certificate_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleRequests.forEach(request => {
        insertStmt.run(request);
    });

    insertStmt.finalize();

    console.log('✅ Database initialized successfully!');
    console.log('📊 Sample data inserted');
});

db.close();
