const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');

// Get all settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await prepare('SELECT * FROM settings').all();
        
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        res.json({
            success: true,
            data: settingsObj
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
});

// Update settings
router.put('/settings', async (req, res) => {
    try {
        const { telegram_enabled, telegram_bot_token, telegram_admin_id } = req.body;

        if (telegram_enabled !== undefined) {
            await prepare(`
                INSERT OR REPLACE INTO settings (key, value, updated_at) 
                VALUES ('telegram_enabled', ?, datetime('now'))
            `).run(telegram_enabled.toString());
        }

        if (telegram_bot_token !== undefined) {
            await prepare(`
                INSERT OR REPLACE INTO settings (key, value, updated_at) 
                VALUES ('telegram_bot_token', ?, datetime('now'))
            `).run(telegram_bot_token);
        }

        if (telegram_admin_id !== undefined) {
            await prepare(`
                INSERT OR REPLACE INTO settings (key, value, updated_at) 
                VALUES ('telegram_admin_id', ?, datetime('now'))
            `).run(telegram_admin_id);
        }

        saveDatabase();


        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
});


module.exports = router;
