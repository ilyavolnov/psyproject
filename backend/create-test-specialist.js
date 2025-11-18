const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

console.log('👤 Создание тестового специалиста\n');
console.log('='.repeat(70));

async function main() {
    try {
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(filebuffer);
        
        console.log('✅ Подключено к БД\n');
        
        // Данные тестового специалиста
        const testSpecialist = {
            name: 'Иван Тестовый',
            photo: 'images/hero-page.webp',
            specialization: 'Психолог, EMDR-терапевт',
            experience: 5,
            price: 5000,
            status: 'available',
            description: 'Тестовый специалист для проверки системы',
            education: 'МГУ им. Ломоносова\nКурсы повышения квалификации',
            additional_services: 'Онлайн консультации',
            testimonials: JSON.stringify([
                {
                    text: 'Отличный специалист! Помог разобраться с проблемой.',
                    author: 'Анна'
                }
            ]),
            page_blocks: JSON.stringify([
                {
                    type: 'about',
                    title: 'О специалисте',
                    content: 'Тестовый специалист для проверки работы системы. Опыт работы 5 лет.'
                },
                {
                    type: 'list',
                    title: 'Образование',
                    items: [
                        'МГУ им. Ломоносова',
                        'Курсы повышения квалификации',
                        'EMDR-терапия, базовый курс'
                    ]
                },
                {
                    type: 'list',
                    title: 'Методы работы',
                    items: [
                        'EMDR-терапия',
                        'Когнитивно-поведенческая терапия',
                        'Гештальт-терапия'
                    ]
                },
                {
                    type: 'testimonials',
                    title: 'Отзывы клиентов',
                    testimonials: [
                        {
                            text: 'Отличный специалист! Помог разобраться с проблемой.',
                            author: 'Анна'
                        }
                    ]
                }
            ])
        };
        
        // Вставляем специалиста
        const sql = `
            INSERT INTO specialists (
                name, photo, specialization, experience, price, status,
                description, education, additional_services, testimonials, page_blocks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
            testSpecialist.name,
            testSpecialist.photo,
            testSpecialist.specialization,
            testSpecialist.experience,
            testSpecialist.price,
            testSpecialist.status,
            testSpecialist.description,
            testSpecialist.education,
            testSpecialist.additional_services,
            testSpecialist.testimonials,
            testSpecialist.page_blocks
        ]);
        
        // Сохраняем БД
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
        
        // Получаем ID созданного специалиста
        const result = db.exec('SELECT last_insert_rowid() as id');
        const newId = result[0].values[0][0];
        
        console.log('✅ Тестовый специалист создан!\n');
        console.log('📋 Данные:');
        console.log(`   ID: ${newId}`);
        console.log(`   Имя: ${testSpecialist.name}`);
        console.log(`   Специализация: ${testSpecialist.specialization}`);
        console.log(`   Опыт: ${testSpecialist.experience} лет`);
        console.log(`   Цена: ${testSpecialist.price} ₽`);
        console.log(`   Статус: ${testSpecialist.status}`);
        console.log(`   Блоков: 4`);
        console.log(`   Отзывов: 1`);
        
        console.log('\n' + '='.repeat(70));
        console.log('💡 Проверьте:');
        console.log('   • Админка: http://localhost:8000/admin-panel.html');
        console.log('   • Страница специалистов: http://localhost:8000/specialists.html');
        console.log(`   • Профиль: http://localhost:8000/specialist-profile.html?id=${newId}`);
        console.log('='.repeat(70) + '\n');
        
        db.close();
        
    } catch (error) {
        console.error('\n❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
