// Add Care Project Course
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function addCourse() {
    try {
        console.log('Adding Care Project course...');

        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Course blocks
        const blocks = [
            {
                type: 'hero',
                data: {
                    image: 'images/course-care-project.jpg',
                    title: 'Проект «Забота»',
                    price: 4500,
                    startDate: '',
                    paymentInstructions: '1. Высылайте скрин оплаты на номер в WhatsApp 89211880755\n2. После оплаты я свяжусь с Вами в WhatsApp.'
                }
            },
            {
                type: 'description',
                data: {
                    image: 'images/course-care-project.jpg',
                    title: 'Почему проект «Забота»?',
                    subtitle: 'Это то, что нужно каждому УСТАВШЕМУ ВЗРОСЛОМУ',
                    contentType: 'Видео-материалы в записи, лекционный материал'
                }
            },
            {
                type: 'program',
                data: {
                    title: 'На проекте вы сможете',
                    items: [
                        'Получить новый опыт ЗАБОТЫ О СЕБЕ',
                        'Научиться отдыхать без чувства вины',
                        'Замедляться и выходить на расслабление',
                        'Проявлять заботу, бережность и внимание к себе',
                        'Усиливать и поддерживать своё ресурсное состояние',
                        'Проживать жизнь в ином качестве (физическом и эмоциональном)'
                    ]
                }
            },
            {
                type: 'features',
                data: {
                    image: 'images/course-care-project.jpg',
                    imagePosition: 'right',
                    title: 'Что включает проект',
                    items: [
                        'Лекционный материал (без воды!), который отчётливо вскроет причины ваших искаженных сценариев заботы о себе и наметит нужный путь для ваших трансформации',
                        'ТОПоповые доказательные модели психотерапии для реальных изменений: IFS, DBT – СЕССИИ',
                        'Все видео-материалы в записи, чтоб вы могли просмотреть их в УДОБНОЕ ВРЕМЯ!',
                        'Доступ к видео-материалу 3 месяца',
                        'Проект отлично вписывается в рабочий график!',
                        'Подходит для тех, у кого НЕТ ОПЫТА терапии! И как дополнение к личной терапии.'
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
            'Проект «Забота»',
            'Это то, что нужно каждому УСТАВШЕМУ ВЗРОСЛОМУ',
            'Проект «Забота» — это то, что нужно каждому УСТАВШЕМУ ВЗРОСЛОМУ. На проекте вы сможете получить новый опыт ЗАБОТЫ О СЕБЕ и научиться: отдыхать без чувства вины, без ощущения «я трачу время впустую»! ЗАМЕДЛЯТЬСЯ и выходить на расслабление и внутренний комфорт. ПРОЯВЛЯТЬ заботу, бережность и внимание к себе. УСИЛИВАТЬ и поддерживать своё ресурсное состояние. И проживать жизнь в ином качестве (физическом и эмоциональном).',
            4500,
            'available',
            'images/course-care-project.jpg',
            '',
            '3 месяца',
            '',
            0,
            '89211880755',
            JSON.stringify([
                'Отдых без чувства вины',
                'Замедление и расслабление',
                'Проявление заботы к себе',
                'Удержание ресурсного состояния',
                'Проживание жизни в ином качестве',
                'Сценарии заботы о себе',
                'Терапевтические модели IFS, DBT'
            ]),
            'Маргарита Румянцева',
            'Врач-психиатр, психотерапевт, сексолог с 10-летним опытом работы, EMDR-терапевт с аккредитацией в Европе, IFS-терапевт',
            JSON.stringify(blocks)
        ]);

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, data);

        db.close();
        console.log('✅ Care Project course added successfully!');
    } catch (error) {
        console.error('❌ Failed to add course:', error);
        process.exit(1);
    }
}

addCourse();