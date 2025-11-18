const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');
const { restartBot, stopBot } = require('../bot');

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

        // Restart bot if telegram settings changed
        if (telegram_enabled !== undefined || telegram_bot_token !== undefined || telegram_admin_id !== undefined) {
            const enabledSetting = telegram_enabled !== undefined ? telegram_enabled : 
                (await prepare('SELECT value FROM settings WHERE key = ?').get('telegram_enabled'))?.value === 'true';
            
            if (enabledSetting) {
                const token = telegram_bot_token || 
                    (await prepare('SELECT value FROM settings WHERE key = ?').get('telegram_bot_token'))?.value;
                const adminId = telegram_admin_id || 
                    (await prepare('SELECT value FROM settings WHERE key = ?').get('telegram_admin_id'))?.value;
                
                if (token && adminId) {
                    await restartBot(token, adminId);
                }
            } else {
                stopBot();
            }
        }

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

// Test Telegram connection
router.post('/settings/test-telegram', async (req, res) => {
    try {
        const { token, adminId } = req.body;

        if (!token || !adminId) {
            return res.status(400).json({
                success: false,
                error: 'Token and Admin ID are required'
            });
        }

        const TelegramBot = require('node-telegram-bot-api');
        const testBot = new TelegramBot(token, { polling: false });

        try {
            await testBot.sendMessage(adminId, '✅ Telegram бот успешно подключен!');
            
            res.json({
                success: true,
                message: 'Telegram connection successful'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'Failed to send test message: ' + error.message
            });
        }
    } catch (error) {
        console.error('Error testing Telegram:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test Telegram connection'
        });
    }
});

module.exports = router;
