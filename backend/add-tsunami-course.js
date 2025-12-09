// Add TSUNAMI Course (Personal Boundaries)
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function addCourse() {
    try {
        console.log('Adding TSUNAMI Course...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Course blocks based on provided information
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/course-tsunami-rita.jpg',
                    title: 'Курс по личным границам «Цунами»',
                    price: 19000,
                    startDate: 'Предзапись V поток',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в What\'sApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/course-tsunami-rita.jpg',
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
                    image: 'images/course-tsunami-rita.jpg',
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
                    image: 'images/course-tsunami-rita.jpg',
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
            'Курс по личным границам «Цунами»',
            'Предзапись V поток',
            'Курс по личным границам «Цунами» - выстраивая и корректируя свои границы СЕГОДНЯ, я двигаюсь в сторону своего эмоционального и физического комфорта, в сторону другого отношения с собой и с миром.',
            19000,
            'coming_soon', // Предзапись
            'images/course-tsunami-rita.jpg',
            '3 недели',
            'Индивидуальное сопровождение психологом-наставником',
            1,
            '89211880755',
            JSON.stringify([
                'Доказательная психотерапия',
                'EMDR-сессии',
                'IFS-сессии',
                'DBT-медитации',
                'Работа с базовыми страхами',
                'Разъяснительный материал'
            ]),
            'Маргарита Румянцева',
            'Врач-психиатр, психотерапевт, EMDR-терапевт с аккредитацией в Европе, IFS-терапевт',
            JSON.stringify(blocks)
        ]);

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
        console.log('✅ TSUNAMI Course added successfully!');
    } catch (error) {
        console.error('❌ Failed to add course:', error);
        process.exit(1);
    }
}

addCourse();