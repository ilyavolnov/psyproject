const { initDatabase, prepare, saveDatabase } = require('./database');

async function addPromoCodesTable() {
    console.log('🔄 Adding promo_codes table...\n');
    
    try {
        await initDatabase();
        
        await prepare(`
            CREATE TABLE IF NOT EXISTS promo_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                discount INTEGER NOT NULL,
                description TEXT,
                max_uses INTEGER DEFAULT 0,
                used_count INTEGER DEFAULT 0,
                valid_from DATETIME,
                valid_until DATETIME,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
        
        console.log('✅ Promo codes table created');
        
        // Add default promo codes
        const defaultPromos = [
            { code: 'WELCOME10', discount: 10, description: 'Скидка 10% для новых клиентов' },
            { code: 'SAVE20', discount: 20, description: 'Скидка 20%' },
            { code: 'FIRST', discount: 15, description: 'Скидка 15% на первый заказ' }
        ];
        
        for (const promo of defaultPromos) {
            await prepare(`
                INSERT OR IGNORE INTO promo_codes (code, discount, description, status)
                VALUES (?, ?, ?, 'active')
            `).run(promo.code, promo.discount, promo.description);
        }
        
        console.log('✅ Default promo codes added');
        
        saveDatabase();
        console.log('✅ Migration completed!\n');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    addPromoCodesTable().then(() => {
        console.log('Done!');
        process.exit(0);
    });
}

module.exports = { addPromoCodesTable };
