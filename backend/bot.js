const TelegramBot = require('node-telegram-bot-api');
const { prepare } = require('./database');

let bot = null;
let currentToken = null;
let currentAdminId = null;
let isEnabled = false;

function initBot(token, adminId) {
    if (!token || !adminId) {
        console.log('⚠️  Telegram bot not configured');
        return null;
    }

    try {
        const newBot = new TelegramBot(token, { polling: true });
        currentToken = token;
        currentAdminId = adminId;
        isEnabled = true;
        
        setupBotHandlers(newBot, adminId);
        console.log('✅ Telegram bot initialized');
        
        return newBot;
    } catch (error) {
        console.error('❌ Failed to initialize Telegram bot:', error.message);
        return null;
    }
}

function setupBotHandlers(botInstance, adminId) {
    // Handle callback queries (button clicks)
    botInstance.on('callback_query', async (query) => {
        const data = query.data;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;

        if (data.startsWith('accept_')) {
            const appId = data.split('_')[1];
            
            const stmt = prepare('UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            stmt.run('accepted', appId);

            botInstance.editMessageReplyMarkup({ inline_keyboard: [] }, {
                chat_id: chatId,
                message_id: messageId
            });

            botInstance.answerCallbackQuery(query.id, {
                text: '✅ Заявка принята',
                show_alert: false
            });

            botInstance.sendMessage(chatId, `✅ Заявка #${appId} принята в работу`);
        }
        else if (data.startsWith('reject_')) {
            const appId = data.split('_')[1];
            
            const stmt = prepare('UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            stmt.run('rejected', appId);

            botInstance.editMessageReplyMarkup({ inline_keyboard: [] }, {
                chat_id: chatId,
                message_id: messageId
            });

            botInstance.answerCallbackQuery(query.id, {
                text: '❌ Заявка отклонена',
                show_alert: false
            });

            botInstance.sendMessage(chatId, `❌ Заявка #${appId} отклонена`);
        }
        else if (data.startsWith('details_')) {
            const appId = data.split('_')[1];
            
            const stmt = prepare('SELECT * FROM requests WHERE id = ?');
            const app = stmt.get(appId);

            if (app) {
                const details = `
📋 <b>Детали заявки #${app.id}</b>

<b>Статус:</b> ${getStatusLabel(app.status)}
<b>Создана:</b> ${new Date(app.created_at).toLocaleString('ru-RU')}
<b>Обновлена:</b> ${new Date(app.updated_at).toLocaleString('ru-RU')}

👤 <b>Контакты:</b>
• Имя: ${app.name}
• Телефон: ${app.phone}
${app.email ? `• Email: ${app.email}` : ''}

📋 <b>Тип заявки:</b> ${getRequestTypeLabel(app.request_type)}
${app.message ? `\n💬 <b>Комментарий:</b>\n${app.message}` : ''}
                `.trim();

                botInstance.sendMessage(chatId, details, { parse_mode: 'HTML' });
            }

            botInstance.answerCallbackQuery(query.id);
        }
    });

    // Bot commands
    botInstance.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        botInstance.sendMessage(chatId, `
👋 Привет! Я бот-администратор для сайта психотерапевта.

Доступные команды:
/stats - Статистика заявок
/new - Новые заявки
/help - Помощь
        `);
    });

    botInstance.onText(/\/stats/, (msg) => {
        const chatId = msg.chat.id;
        
        const stats = prepare(`
            SELECT 
                status,
                COUNT(*) as count
            FROM requests
            WHERE deleted = 0
            GROUP BY status
        `).all();

        const total = prepare('SELECT COUNT(*) as count FROM requests WHERE deleted = 0').get();

        let message = `📊 <b>Статистика заявок</b>\n\n`;
        message += `<b>Всего:</b> ${total.count}\n\n`;
        
        stats.forEach(stat => {
            message += `${getStatusLabel(stat.status)}: ${stat.count}\n`;
        });

        botInstance.sendMessage(chatId, message, { parse_mode: 'HTML' });
    });

    botInstance.onText(/\/new/, (msg) => {
        const chatId = msg.chat.id;
        
        const newApps = prepare(`
            SELECT * FROM requests 
            WHERE status = 'new' AND deleted = 0
            ORDER BY created_at DESC 
            LIMIT 10
        `).all();

        if (newApps.length === 0) {
            botInstance.sendMessage(chatId, '✅ Нет новых заявок');
            return;
        }

        botInstance.sendMessage(chatId, `📋 <b>Новые заявки (${newApps.length}):</b>`, { parse_mode: 'HTML' });

        newApps.forEach(app => {
            notifyNewApplication(app);
        });
    });

    botInstance.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        botInstance.sendMessage(chatId, `
📖 <b>Помощь</b>

<b>Команды:</b>
/start - Начать работу
/stats - Статистика заявок
/new - Показать новые заявки
/help - Эта справка

<b>Уведомления:</b>
Вы будете получать уведомления о новых заявках автоматически.
Используйте кнопки под сообщением для быстрых действий.
        `, { parse_mode: 'HTML' });
    });
}

// Send notification about new application
function notifyNewApplication(application) {
    if (!bot || !isEnabled || !currentAdminId) {
        return;
    }

    try {
        const message = `
🆕 <b>Новая заявка #${application.id}</b>

👤 <b>Имя:</b> ${application.name}
📞 <b>Телефон:</b> ${application.phone}
${application.email ? `📧 <b>Email:</b> ${application.email}\n` : ''}
📋 <b>Тип заявки:</b> ${getRequestTypeLabel(application.request_type)}
${application.message ? `💬 <b>Комментарий:</b> ${application.message}\n` : ''}
🕐 <b>Дата:</b> ${new Date(application.created_at).toLocaleString('ru-RU')}
        `.trim();

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '✅ Принять', callback_data: `accept_${application.id}` },
                    { text: '❌ Отклонить', callback_data: `reject_${application.id}` }
                ],
                [
                    { text: '📋 Подробнее', callback_data: `details_${application.id}` }
                ]
            ]
        };

        bot.sendMessage(currentAdminId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
        }).catch(err => {
            console.error('Error sending Telegram notification:', err);
        });
    } catch (error) {
        console.error('Error in notifyNewApplication:', error);
    }
}

function getRequestTypeLabel(type) {
    const labels = {
        'urgent': '🚨 Срочная консультация',
        'family': '👨‍👩‍👧 Семейная сессия в 4 руки',
        'specialist': '👨‍⚕️ Запись к специалисту',
        'general': '💬 Общая консультация'
    };
    return labels[type] || type;
}



function getStatusLabel(status) {
    const labels = {
        'new': '🆕 Новая',
        'accepted': '✅ Принята',
        'rejected': '❌ Отклонена',
        'completed': '✔️ Завершена'
    };
    return labels[status] || status;
}

async function restartBot(token, adminId) {
    stopBot();
    bot = initBot(token, adminId);
    return bot;
}

function stopBot() {
    if (bot) {
        try {
            bot.stopPolling();
            console.log('🛑 Telegram bot stopped');
        } catch (error) {
            console.error('Error stopping bot:', error);
        }
        bot = null;
        isEnabled = false;
    }
}

function loadBotFromSettings() {
    try {
        const enabled = prepare('SELECT value FROM settings WHERE key = ?').get('telegram_enabled');
        const token = prepare('SELECT value FROM settings WHERE key = ?').get('telegram_bot_token');
        const adminId = prepare('SELECT value FROM settings WHERE key = ?').get('telegram_admin_id');

        if (enabled?.value === 'true' && token?.value && adminId?.value) {
            bot = initBot(token.value, adminId.value);
        } else {
            console.log('⚠️  Telegram bot disabled or not configured');
        }
    } catch (error) {
        console.error('Error loading bot settings:', error);
    }
}

module.exports = {
    bot,
    notifyNewApplication,
    stopPolling: stopBot,
    restartBot,
    stopBot,
    loadBotFromSettings
};
