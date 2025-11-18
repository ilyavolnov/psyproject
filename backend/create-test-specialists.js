const { initDatabase, prepare, saveDatabase } = require('./database');

async function createTestSpecialists() {
    console.log('🔄 Creating test specialists...\n');
    
    try {
        await initDatabase();
        
        const testSpecialists = [
            {
                name: 'Румянцева Ольга',
                photo: 'images/specialists/rumyantceva.jpg',
                specialization: 'Клинический психолог, психотерапевт',
                experience: 15,
                price: 5000,
                status: 'available',
                description: 'Клинический психолог, психотерапевт с 15-летним опытом работы',
                education: 'МГУ им. М.В. Ломоносова, факультет психологии',
                additional_services: 'Индивидуальная терапия, семейная терапия'
            },
            {
                name: 'Иванова Мария',
                photo: 'images/specialists/ivanova.jpg',
                specialization: 'Психолог-консультант',
                experience: 8,
                price: 4000,
                status: 'available',
                description: 'Специалист по работе с тревожными расстройствами',
                education: 'МГППУ, клиническая психология',
                additional_services: 'Работа с тревогой, паническими атаками'
            },
            {
                name: 'Петров Алексей',
                photo: 'images/specialists/petrov.jpg',
                specialization: 'Семейный психолог',
                experience: 12,
                price: 4500,
                status: 'available',
                description: 'Специалист по семейной и парной терапии',
                education: 'СПбГУ, психология семьи',
                additional_services: 'Семейная терапия, парная терапия'
            }
        ];
        
        const insertQuery = `
            INSERT INTO specialists (
                name, photo, specialization, experience, price, status,
                description, education, additional_services
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const specialist of testSpecialists) {
            await prepare(insertQuery).run(
                specialist.name,
                specialist.photo,
                specialist.specialization,
                specialist.experience,
                specialist.price,
                specialist.status,
                specialist.description,
                specialist.education,
                specialist.additional_services
            );
            
            console.log(`✅ Created: ${specialist.name}`);
        }
        
        saveDatabase();
        
        // Verify
        const count = await prepare('SELECT COUNT(*) as count FROM specialists').get();
        console.log(`\n🎉 Total specialists in database: ${count.count}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createTestSpecialists().then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
});
