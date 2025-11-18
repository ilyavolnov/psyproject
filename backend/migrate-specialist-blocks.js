// Migration script to convert existing specialist data to page blocks
const fs = require('fs');
const path = require('path');
const { initDatabase, prepare, saveDatabase } = require('./database');

async function migrateSpecialistBlocks() {
    console.log('🔄 Converting specialist data to page blocks...');
    
    try {
        await initDatabase();
        
        // Read specialists-data.json
        const jsonPath = path.join(__dirname, '../specialists-data.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(jsonData);
        
        console.log(`👥 Found ${data.specialists.length} specialists`);
        
        data.specialists.forEach((spec, index) => {
            console.log(`\n📝 Processing: ${spec.name} (ID: ${spec.id})`);
            
            const blocks = [];
            const testimonials = [];
            
            // 1. Therapy Methods block (if exists)
            if (spec.therapyMethods && spec.therapyMethods.length > 0) {
                blocks.push({
                    type: 'list',
                    title: 'Терапия в доказательных модальностях',
                    items: spec.therapyMethods
                });
                console.log(`  ✅ Added therapy methods block (${spec.therapyMethods.length} items)`);
            }
            
            // 2. Additional Services block (if exists)
            if (spec.additionalServices) {
                blocks.push({
                    type: 'text',
                    title: 'Дополнительные услуги',
                    content: spec.additionalServices
                });
                console.log(`  ✅ Added additional services block`);
            }
            
            // 3. Education block (if exists)
            if (spec.education && spec.education.length > 0) {
                blocks.push({
                    type: 'list',
                    title: 'Образование',
                    items: spec.education
                });
                console.log(`  ✅ Added education block (${spec.education.length} items)`);
            }
            
            // 4. Approaches block (if exists)
            if (spec.approaches && spec.approaches.length > 0) {
                blocks.push({
                    type: 'list',
                    title: 'Подходы в работе',
                    items: spec.approaches
                });
                console.log(`  ✅ Added approaches block (${spec.approaches.length} items)`);
            }
            
            // 5. Payment scheme block (always add)
            blocks.push({
                type: 'payment',
                title: 'Схема оплаты',
                items: [
                    'На номер в WhatsApp 8 921 188 07 55 вы отправляете скрин оплаты (или электронный чек) и указываете имя специалиста',
                    'После вы определяете время консультации совместно с терапевтом.',
                    'Оплата последующих сессий проводится ЗА СУТКИ до запланированной встречи по указанным выше реквизитам. По каждому переводу скидывается скрин (или электронный чек) в WhatsApp',
                    'Правила отмены:',
                    'В случае отмены консультации более, чем за 2 часа, денежные средства остаются на счету с возможностью оплаты следующей сессии (без штрафных санкций).',
                    'При отмене консультации менее, чем за 2 часа, денежные средства не компенсируются. (Исключение – обстоятельства непреодолимой силы.)'
                ]
            });
            console.log(`  ✅ Added payment scheme block`);
            
            // Extract testimonials (if exists)
            if (spec.testimonials && spec.testimonials.length > 0) {
                spec.testimonials.forEach(t => {
                    testimonials.push({
                        text: t.text,
                        author: t.author
                    });
                });
                console.log(`  ✅ Extracted ${testimonials.length} testimonials`);
            }
            
            // Update database
            try {
                const updateQuery = `
                    UPDATE specialists 
                    SET page_blocks = ?, testimonials = ?, updated_at = datetime('now')
                    WHERE id = ?
                `;
                
                prepare(updateQuery).run(
                    JSON.stringify(blocks),
                    JSON.stringify(testimonials),
                    spec.id
                );
                
                console.log(`  💾 Saved ${blocks.length} blocks and ${testimonials.length} testimonials to database`);
            } catch (error) {
                console.error(`  ❌ Error updating specialist ${spec.id}:`, error.message);
            }
        });
        
        saveDatabase();
        console.log('\n🎉 Migration completed!');
        
        // Verify
        const specialists = prepare('SELECT id, name, page_blocks, testimonials FROM specialists').all();
        console.log('\n📊 Verification:');
        specialists.forEach(s => {
            const blocks = s.page_blocks ? JSON.parse(s.page_blocks) : [];
            const testimonials = s.testimonials ? JSON.parse(s.testimonials) : [];
            console.log(`  ${s.name}: ${blocks.length} blocks, ${testimonials.length} testimonials`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

if (require.main === module) {
    migrateSpecialistBlocks().then(() => {
        console.log('\n✅ Migration script finished');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = { migrateSpecialistBlocks };
