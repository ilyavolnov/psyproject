// Add Psychosomatic Course
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function addCourse() {
    try {
        console.log('Adding Psychosomatic Course...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Course blocks based on provided information
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/course-psychosomatic.jpg',
                    title: 'Курс для психологов «Работа в психосоматических запросах»',
                    price: 15900,
                    startDate: '',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в What\'sApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/course-psychosomatic.jpg',
                    title: 'Что Вас ждет?',
                    subtitle: 'Вооружитесь знаниями и инструментами — и не бойтесь психосоматического запроса!',
                    contentType: 'Видео-записи, презентации, опросники, список литературы'
                }
            },
            {
                type: 'program',
                data: {
                    title: 'Программа курса',
                    items: [
                        'Механизм возникновения психосоматики - Что искать психологу?',
                        'Сбор анамнеза - 7 ШАГОВ — 7 потенциальных мишеней терапии',
                        'РАЗБОР СТРУКТУРЫ ЛИЧНОСТИ психосоматического клиента:',
                        '  1. Особенности организации (На что обратить внимание?)',
                        '  2. Эмоциональные дефициты',
                        '  3. Психологические защиты и ПАТТЕРНЫ, которые могут блокировать терапию',
                        'С какими соматическими заболеваниями психологу стоит работать, с какими — нет?',
                        '3 готовых рабочих ИНСТРУМЕНТА (На примере гештальт-терапии, адаптивной переработки информации и терапии частей/субличностей)',
                        'Вспомогательные методы (движение, «телесная география эмоций», тестирование по шкалам)',
                        'Ухудшение соматического состояния клиента как норма — 3 индикатора'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/course-psychosomatic.jpg',
                    imagePosition: 'right',
                    title: 'Что вы получите',
                    items: [
                        'Доступ к записи на 3 месяца',
                        'Доступ к вспомогательным материалам (презентация, опросники, список литературы) — без ограничений',
                        'Вооружитесь знаниями и инструментами — и не бойтесь психосоматического запроса!'
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

        // Check if course already exists
        const existingCourse = db.exec("SELECT id FROM courses WHERE title = 'Курс для психологов «Работа в психосоматических запросах»'");
        
        if (existingCourse.length > 0 && existingCourse[0].values.length > 0) {
            // Update existing course
            const query = `
                UPDATE courses
                SET subtitle = ?, description = ?, price = ?, status = ?, image = ?,
                    access_duration = ?, feedback_duration = ?, has_certificate = ?, 
                    whatsapp_number = ?, topics = ?, author_name = ?, 
                    author_description = ?, page_blocks = ?, updated_at = datetime('now')
                WHERE title = ?
            `;
            
            db.run(query, [
                'Вооружитесь знаниями и инструментами — и не бойтесь психосоматического запроса!',
                'Курс для психологов «Работа в психосоматических запросах» - Пройти курс — ВООРУЖИТЬСЯ ЗНАНИЯМИ И ИНСТРУМЕНТАМИ — и не бояться психосоматического запроса!',
                15900,
                'available',
                'images/course-psychosomatic.jpg',
                '3 месяца',
                'Доступ к вспомогательным материалам (презентация, опросники, список литературы) — без ограничений',
                1,
                '89211880755',
                JSON.stringify([
                    'Механизм возникновения психосоматики',
                    'Сбор анамнеза - 7 ШАГОВ',
                    'РАЗБОР СТРУКТУРЫ ЛИЧНОСТИ психосоматического клиента',
                    'С какими соматическими заболеваниями работать',
                    '3 готовых рабочих ИНСТРУМЕНТА',
                    'Вспомогательные методы',
                    'Ухудшение соматического состояния клиента как норма'
                ]),
                'Маргарита Румянцева',
                'Врач-психиатр, психотерапевт, сексолог с 10-летним опытом работы, EMDR-терапевт с аккредитацией в Европе, IFS-терапевт',
                JSON.stringify(blocks),
                'Курс для психологов «Работа в психосоматических запросах»'
            ]);
            
            console.log('✅ Psychosomatic Course updated successfully!');
        } else {
            // Insert new course
            const query = `
                INSERT INTO courses (
                    title, subtitle, description, price, status, image,
                    access_duration, feedback_duration,
                    has_certificate, whatsapp_number, topics,
                    author_name, author_description, page_blocks,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            db.run(query, [
                'Курс для психологов «Работа в психосоматических запросах»',
                'Вооружитесь знаниями и инструментами — и не бойтесь психосоматического запроса!',
                'Курс для психологов «Работа в психосоматических запросах» - Пройти курс — ВООРУЖИТЬСЯ ЗНАНИЯМИ И ИНСТРУМЕНТАМИ — и не бояться психосоматического запроса!',
                15900,
                'available',
                'images/course-psychosomatic.jpg',
                '3 месяца',
                'Доступ к вспомогательным материалам (презентация, опросники, список литературы) — без ограничений',
                1,
                '89211880755',
                JSON.stringify([
                    'Механизм возникновения психосоматики',
                    'Сбор анамнеза - 7 ШАГОВ',
                    'РАЗБОР СТРУКТУРЫ ЛИЧНОСТИ психосоматического клиента',
                    'С какими соматическими заболеваниями работать',
                    '3 готовых рабочих ИНСТРУМЕНТА',
                    'Вспомогательные методы',
                    'Ухудшение соматического состояния клиента как норма'
                ]),
                'Маргарита Румянцева',
                'Врач-психиатр, психотерапевт, сексолог с 10-летним опытом работы, EMDR-терапевт с аккредитацией в Европе, IFS-терапевт',
                JSON.stringify(blocks)
            ]);
            
            console.log('✅ Psychosomatic Course added successfully!');
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
    } catch (error) {
        console.error('❌ Failed to add/update course:', error);
        process.exit(1);
    }
}

addCourse();