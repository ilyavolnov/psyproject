const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');

// Get all promo codes
router.get('/promo-codes', async (req, res) => {
    try {
        const promoCodes = await prepare('SELECT * FROM promo_codes ORDER BY created_at DESC').all();
        res.json({ success: true, data: promoCodes });
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch promo codes' });
    }
});

// Validate promo code
router.post('/promo-codes/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const promo = await prepare('SELECT * FROM promo_codes WHERE code = ? AND status = ?').get(code.toUpperCase(), 'active');
        
        if (!promo) {
            return res.json({ success: false, error: 'Invalid promo code' });
        }
        
        // Check validity dates
        const now = new Date();
        if (promo.valid_from && new Date(promo.valid_from) > now) {
            return res.json({ success: false, error: 'Promo code not yet valid' });
        }
        if (promo.valid_until && new Date(promo.valid_until) < now) {
            return res.json({ success: false, error: 'Promo code expired' });
        }
        
        // Check usage limit
        if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
            return res.json({ success: false, error: 'Promo code usage limit reached' });
        }
        
        res.json({ success: true, data: { discount: promo.discount, code: promo.code } });
    } catch (error) {
        console.error('Error validating promo code:', error);
        res.status(500).json({ success: false, error: 'Failed to validate promo code' });
    }
});

// Create promo code
router.post('/promo-codes', async (req, res) => {
    try {
        const { code, discount, description, max_uses, valid_from, valid_until } = req.body;
        
        if (!code || !discount) {
            return res.status(400).json({ success: false, error: 'Code and discount are required' });
        }
        
        const result = await prepare(`
            INSERT INTO promo_codes (code, discount, description, max_uses, valid_from, valid_until, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        `).run(code.toUpperCase(), discount, description, max_uses || 0, valid_from, valid_until);
        
        saveDatabase();
        res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (error) {
        console.error('Error creating promo code:', error);
        res.status(500).json({ success: false, error: 'Failed to create promo code' });
    }
});

// Update promo code
router.put('/promo-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(key === 'code' ? updates[key].toUpperCase() : updates[key]);
            }
        });
        
        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        
        fields.push('updated_at = datetime(\'now\')');
        values.push(id);
        
        await prepare(`UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        saveDatabase();
        
        res.json({ success: true, message: 'Promo code updated' });
    } catch (error) {
        console.error('Error updating promo code:', error);
        res.status(500).json({ success: false, error: 'Failed to update promo code' });
    }
});

// Delete promo code
router.delete('/promo-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prepare('DELETE FROM promo_codes WHERE id = ?').run(id);
        saveDatabase();
        res.json({ success: true, message: 'Promo code deleted' });
    } catch (error) {
        console.error('Error deleting promo code:', error);
        res.status(500).json({ success: false, error: 'Failed to delete promo code' });
    }
});

module.exports = router;
