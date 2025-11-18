// Add RPP Marathon Course
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function addCourse() {
    try {
        console.log('Adding RPP Marathon course...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Course blocks
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/courses/rpp/mainimaje.jpeg',
                    title: 'Марафон по РПП «Я больше не переедаю»',
                    price: 9900,
                    startDate: '10 НОЯБРЯ',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в WhatsApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/courses/rpp/description.jpg',
                    title: 'Почему мы переедаем?',
                    subtitle: 'Трансформирующий проект, направленный на коррекцию расстройств пищевого поведения при помощи доказательных психотерапевтических методик',
                    contentType: 'Лекция + презентация'
                }
            },
            {
                type: 'program',
                data: {
                    title: 'Программа курса',
                    items: [
                        'Прокрастинация через еду',
                        'Переедание выходного дня (или пищевой разврат)',
                        'Чек-лист на неблагополучное ПП',
                        'Почему диеты не работают?',
                        'Сет-поинт. Как он меняется?',
                        'Эффект йо-йо',
                        'РПП – про еду или про эмоциональное неблагополучие?',
                        'Домашнее задание',
                        'EMDR-сессия: Как применять?',
                        'Сессия на РЕСУРС',
                        'Сессия на эмоциональные триггеры',
                        'Работа с состояниями, запускающими переедание',
                        'Упражнение на тягу',
                        'Снижаем зависимость от значимых продуктов',
                        'Формируем навык управления количеством съеденного',
                        'Сессия на эйфорию от еды',
                        'Почему я не могу остановиться?',
                        'Сессия на чувство вины после переедания',
                        'Выходим из «порочного круга РППешника»',
                        'IFS-сессия: Работа с переедающей частью',
                        'Лекция + презентация + медитация',
                        'Медитация из ДПТ',
                        'Ресурс, самоподдержка',
                        'Сессия на сексуальность',
                        'Тело, лёгкость, секс',
                        'ПРАКТИКУМ «Забота о теле»',
                        'Лекция + упражнения'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/courses/rpp/features.jpg',
                    imagePosition: 'right',
                    title: 'Что вы получите',
                    items: [
                        'Индивидуальное сопровождение КАЖДОГО участника психологом команды',
                        'Удобный доступ к материалам (запись в любое удобное время)',
                        'Информация «без воды» и банальностей. Только терапия, только хардкор!',
                        '3 недели, которые изменят твоё отношение к еде и к себе «Я больше НЕ ПЕРЕЕДАЮ»'
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

        // Insert course
        const query = `
            INSERT INTO courses (
                title, subtitle, description, price, status, image,
                release_date, access_duration, feedback_duration,
                has_certificate, whatsapp_number, topics, 
                author_name, author_description, page_blocks,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `;

        db.run(query, [
            'Марафон по РПП «Я больше не переедаю»',
            'Трансформирующий проект по коррекции РПП',
            'Трансформирующий проект, направленный на коррекцию расстройств пищевого поведения при помощи доказательных психотерапевтических методик',
            9900,
            'available',
            'images/courses/rpp/mainimaje.jpeg',
            '10 НОЯБРЯ',
            '3 недели',
            'Индивидуальное сопровождение психологом команды',
            0,
            '89211880755',
            JSON.stringify([]),
            'Маргарита Румянцева',
            'Врач-психиатр, психотерапевт, сексолог',
            JSON.stringify(blocks)
        ]);

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
        console.log('✅ RPP Marathon course added successfully!');
    } catch (error) {
        console.error('❌ Failed to add course:', error);
        process.exit(1);
    }
}

addCourse();
