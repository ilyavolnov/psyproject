// Add Project New Year Wonder Webinar
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function addWebinar() {
    try {
        console.log('Adding Project New Year Wonder Webinar...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Webinar blocks based on provided information
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/img_7357-scaled-e1734517088327-792x1024.jpg',
                    title: 'Проект «Новогоднее чудо»',
                    price: 3900,
                    startDate: '',
                    paymentInstructions: '1. На номер в WhatsApp +79211880755 отправьте скрин оплаты (или электронный чек).\n2. После оплаты мы свяжемся с Вами в WhatsApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/img_7357-scaled-e1734517088327-792x1024.jpg',
                    title: 'Проект «Новогоднее чудо»',
                    subtitle: 'Как приблизить жизнь мечты в 2026 году?',
                    contentType: 'IFS-сессия для работы с частью личности, которая хранит в себе лучший сценарий вашей жизни'
                }
            },
            {
                type: 'program',
                data: {
                    title: 'Что включает вебинар',
                    items: [
                        'IFS-сессия для работы с частью личности, которая хранит в себе лучший сценарий вашей жизни',
                        'Новогодняя рабочая тетрадь для построение эффективного плана',
                        'Начните 2026 года с разрешения МЕЧТАТЬ, строить смелые цели и эффективно к ним двигаться',
                        'Доступ к видео материалу 1 месяц'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/img_7357-scaled-e1734517088327-792x1024.jpg',
                    imagePosition: 'right',
                    title: 'Преимущества участия',
                    items: [
                        'Работа с внутренней частью, хранящей лучший сценарий вашей жизни',
                        'Практические инструменты для построения эффективного плана',
                        'Разрешение себе мечтать и строить смелые цели',
                        'Доступ к видео-материалам в течение 1 месяца'
                    ]
                }
            },
            {
                type: 'author',
                data: {
                    photo: 'images/specialists/margarita.jpg',
                    name: 'Маргарита Румянцева',
                    credentials: [
                        'Врач-психиатр, психотерапевт, сексолог (стаж с 2009 г., опыт работы в психиатрической больнице им. П. П. Кащенко более 10 лет)',
                        'EMDR-терапевт с аккредитацией в Европе',
                        'Сертифицированный Супервизор',
                        'Групповой психотерапевт',
                        'Семейный консультант',
                        'IFS-терапевт',
                        'Преподаватель Института Практической Психологии Иматон, Центра EMDR/ДПДГ в Санкт-Петербурге',
                        'Эксперт федерального ТВ-канала «Пятница»',
                        'Создатель обучающих курсов для психологов и автор психотерапевтических онлайн-проектов (запуски с 2018 г.)'
                    ]
                }
            }
        ];

        // Insert new webinar
        const query = `
            INSERT INTO courses (
                title, subtitle, description, price, status, image,
                access_duration, feedback_duration,
                has_certificate, whatsapp_number, topics,
                author_name, author_description, page_blocks,
                created_at, updated_at, type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
        `;

        db.run(query, [
            'Проект «Новогоднее чудо»',
            'Как приблизить жизнь мечты в 2026 году?',
            'IFS-сессия для работы с частью личности, которая хранит в себе лучший сценарий вашей жизни. Новогодняя рабочая тетрадь для построение эффективного плана. Начните 2026 года с разрешения МЕЧТАТЬ, строить смелые цели и эффективно к ним двигаться.',
            3900,
            'available', // В доступе
            'images/img_7357-scaled-e1734517088327-792x1024.jpg',
            '1 месяц',
            'Доступ к видео материалу 1 месяц',
            0, // не выдается сертификат
            '79211880755', // WhatsApp номер
            JSON.stringify([
                'IFS-сессия для работы с частью личности',
                'Новогодняя рабочая тетрадь',
                'Построение эффективного плана',
                'Разрешение себе мечтать',
                'Доступ к видео-материалу'
            ]),
            'Маргарита Румянцева',
            'Врач-психиатр, психотерапевт, сексолог с 10-летним опытом работы, EMDR-терапевт с аккредитацией в Европе, IFS-терапевт',
            JSON.stringify(blocks),
            'webinar' // тип - вебинар
        ]);

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
        console.log('✅ Project New Year Wonder Webinar added successfully!');
    } catch (error) {
        console.error('❌ Failed to add webinar:', error);
        process.exit(1);
    }
}

addWebinar();