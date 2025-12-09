// Update LAVINA Course with actual images from website
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateCourse() {
    try {
        console.log('Updating LAVINA Course with actual images from website...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Updated course blocks with actual images from website
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/rita.jpg', // Main course image from website
                    title: 'КУРС «ЛАВИНА»',
                    price: 19000,
                    startDate: 'Предзапись',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в What\'sApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/rita.jpg', // Same main image
                    title: 'Секс – это кайф, а не повод для головной боли',
                    subtitle: '3 недели для нового качества интимной жизни',
                    contentType: 'Видео-сессии и уроки в записи'
                }
            },
            {
                type: 'program',
                data: {
                    title: 'Что вас ждет на курсе',
                    items: [
                        'Новые паттерны сексуального поведения',
                        'Новые убеждения о своей внутренней женщине',
                        'Новый опыт контакта со своим телом',
                        'Новые техники и сценарии для бОльшего удовольствия',
                        'Техники для развития зрелых эрогенных зон (клиторной и вагинальной чувствительности)',
                        'Техники самостимуляции (выход на адаптивную стимуляцию: вместо сжимания ног, душа и гаджета – НОВЫЕ паттерны стимуляции)',
                        'Техники для усиления ВОЗБУЖДЕНИЯ во время контакта',
                        'Техники для оргазма с партнёром («7 топовых практик для ярких ощущений»)',
                        'Психотерапевтических сессий (EMDR, IFS): Переработки травматичного материала, который давит на вашу сексуальность виной, стыдом и блокирует чувствительность',
                        'Блок «Психология секса»: Мастер-класс по флирту и пресексуальному этапу',
                        'Сессия на сексуальность (обновлённый протокол)',
                        'Сессия на ресурс: «Есть время на секс»'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/coursespage__item3.png', // 'Секс – это кайф' image from website
                    imagePosition: 'right',
                    title: 'Особенности курса',
                    items: [
                        'Все видео-сессии и уроки в ЗАПИСИ для доступа в любое удобное вам время',
                        'Каждую участницу будет бережно сопровождать на пути интимных трансформаций психолог-наставник команды',
                        'ТАК ГЛУБОКО И МАСШТАБНО В ТЕМУ СЕКСА ЕЩЁ НИКТО НЕ ЗАХОДИЛ!',
                        'Партнёр для курса не нужен! Но если он есть, пусть держится крепче'
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
                        'Создатель обучающих курсов для психологов и автор психотерапевтических онлайн-проектов (запуски с 2018 г.)',
                        'Опыт в сфере женской сексологии: общий врачебный стаж – с 2009г',
                        'Опыт ОЧНО ПРАКТИКУЮЩЕГО врача-сексолога с 2012г',
                        'Опыт проведения конференций и обучающих курсов для психологов по теме «Нарушение ОРГАЗМА у женщин» с 2017г',
                        'Опыт запуска сексологических онлайн-проектов с 2018г (более 30 потоков)',
                        'Опыт работы с сексуализированной травмой в EMDR-подходе с 2019г (аккредитация EMDR-терапии в Европе)',
                        'Опыт супервизирования по сексологическим запросам с 2020г',
                        'За годы практики более 5000 женщин узнали –что такое ОРГАЗМ и наполняющее ЛИБИДО'
                    ]
                }
            }
        ];

        // Update the course with new image paths
        const query = `
            UPDATE courses
            SET image = ?, page_blocks = ?, updated_at = datetime('now')
            WHERE title = ?
        `;
        
        const result = db.run(query, [
            'images/rita.jpg', // Main course image
            JSON.stringify(blocks),
            'КУРС «ЛАВИНА»'
        ]);
        
        if (result.getRowsModified() > 0) {
            console.log('✅ LAVINA Course updated successfully with actual images from website!');
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