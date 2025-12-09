// Update Psychosomatic Course with actual images from website
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateCourse() {
    try {
        console.log('Updating Psychosomatic Course with actual images...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Updated course blocks with actual images from website
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/img_9067-e1719250360616-1024x962.jpg', // Main course image
                    title: 'Курс для психологов «Работа в психосоматических запросах»',
                    price: 15900,
                    startDate: '',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в What\'sApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/img-26-e1719234676647.jpg', // 'Что Вас ждет?'
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
                    image: 'images/img-8-e1719234606765.jpg', // '<span>В</span> доступе'
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

        // First, let's check if the course exists
        const checkQuery = "SELECT id FROM courses WHERE title = 'Курс для психологов «Работа в психосоматических запросах»'";
        const checkResult = db.exec(checkQuery);
        
        if (checkResult.length > 0 && checkResult[0].values.length > 0) {
            // Update the course with new image paths and page blocks
            const query = `
                UPDATE courses
                SET image = ?, access_duration = ?, feedback_duration = ?, 
                    page_blocks = ?, updated_at = datetime('now')
                WHERE title = ?
            `;
            
            const result = db.run(query, [
                'images/img_9067-e1719250360616-1024x962.jpg',  // Main course image
                '3 месяца',
                'Доступ к вспомогательным материалам (презентация, опросники, список литературы) — без ограничений',
                JSON.stringify(blocks),
                'Курс для психологов «Работа в психосоматических запросах»'
            ]);
            
            console.log('✅ Psychosomatic Course updated successfully with actual images from website!');
            console.log('Rows updated:', result.getRowsModified());
        } else {
            console.log('❌ Course not found in database');
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