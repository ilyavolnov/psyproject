// Update TSUNAMI Course with actual images from website
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function updateCourse() {
    try {
        console.log('Updating TSUNAMI Course with actual images from website...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Updated course blocks with actual images from website
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/img-51-1-1024x946.jpg', // Main course image from website
                    title: 'Курс по личным границам «Цунами»',
                    price: 19000,
                    startDate: 'Предзапись V поток',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в What\'sApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/tsunami-novoe-foto-scaled-1.jpeg', // 'Зачем нам нужны границы?' image
                    title: 'Зачем нам нужны границы?',
                    subtitle: 'Граница оберегает меня от мира, когда я нуждаюсь в безопасности, уединении, расслаблении и оберегает мир от меня',
                    contentType: 'Видео-сессии и уроки в записи'
                }
            },
            {
                type: 'program',
                data: {
                    title: 'Как это сделать на курсе за 3 недели?',
                    items: [
                        'Лекционный (разъяснительный) материал для вашего «рацио»',
                        'Переработка (EMDR-сессии)',
                        'Работа с частями (IFS-сессии)',
                        'Опорные медитации (DBT)',
                        'Проведём 10 сессий на базовые страхи: отвержения, одиночества, на тревогу за последствия выбора «быть собой», на вторичные чувства (вину, стыд, злость)',
                        'Все материалы чётко структурированы, понятны и прозрачны',
                        'Сессии в записи и с удобным доступом',
                        'Доказательная психотерапия: EMDR, IFS, DBT (ТОП на сегодня)'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/tsunami-novoe-foto-scaled-1.jpeg',
                    imagePosition: 'right',
                    title: 'Когда мои границы слабые',
                    items: [
                        'Я часто терплю дискомфорт',
                        'Я живу в условиях постоянной нехватки времени',
                        'Я быстро истощаюсь',
                        'Я испытываю перманентное напряжение',
                        'Я не могу построить достаточно удовлетворяющие отношения',
                        'Я часто испытываю вину и стыд за себя, свои чувства и поведение',
                        'Я плохо понимаю, чего я хочу',
                        'Я не могу опираться на себя',
                        'Я часто чувствую себя недостойным, хуже других',
                        'Я действую против себя, чтоб угодить другим',
                        'Я часто чувствую себя заложником обстоятельств',
                        'Я не могу звучать о своих потребностях',
                        'Я не умею заботиться о себе'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/img-27.webp', // 'Почему Так?' image
                    imagePosition: 'right',
                    title: 'Когда мои границы жёсткие',
                    items: [
                        'Я имею сложности в контакте с другими людьми, особенно в близких отношениях',
                        'Я часто испытываю недовольство, раздражение, злость',
                        'Я склонен к аутоагрессии (алкоголь, небезопасный секс, пренебрежение к сигналам тела)',
                        'Я часто чувствую себя одиноким среди людей'
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

        // Update the course with new image paths
        const query = `
            UPDATE courses
            SET image = ?, page_blocks = ?, updated_at = datetime('now')
            WHERE title = ?
        `;
        
        const result = db.run(query, [
            'images/img-51-1-1024x946.jpg', // Main course image
            JSON.stringify(blocks),
            'Курс по личным границам «Цунами»'
        ]);
        
        if (result.getRowsModified() > 0) {
            console.log('✅ TSUNAMI Course updated successfully with actual images from website!');
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