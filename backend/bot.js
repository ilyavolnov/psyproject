const TelegramBot = require('node-telegram-bot-api');
const db = require('./database');

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set!');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Send notification about new application
function notifyNewApplication(application) {
    if (!adminId) {
        console.warn('⚠️  TELEGRAM_ADMIN_ID is not set, skipping notification');
        return;
    }

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

    bot.sendMessage(adminId, message, {
        parse_mode: 'HTML',
        reply_markup: keyboard
    }).catch(err => {
        console.error('Error sending Telegram notification:', err);
    });
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

// Handle callback queries (button clicks)
bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data.startsWith('accept_')) {
        const appId = data.split('_')[1];
        
        const stmt = db.prepare('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run('accepted', appId);

        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: chatId,
            message_id: messageId
        });

        bot.answerCallbackQuery(query.id, {
            text: '✅ Заявка принята',
            show_alert: false
        });

        bot.sendMessage(chatId, `✅ Заявка #${appId} принята в работу`);
    }
    else if (data.startsWith('reject_')) {
        const appId = data.split('_')[1];
        
        const stmt = db.prepare('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run('rejected', appId);

        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: chatId,
            message_id: messageId
        });

        bot.answerCallbackQuery(query.id, {
            text: '❌ Заявка отклонена',
            show_alert: false
        });

        bot.sendMessage(chatId, `❌ Заявка #${appId} отклонена`);
    }
    else if (data.startsWith('details_')) {
        const appId = data.split('_')[1];
        
        const stmt = db.prepare('SELECT * FROM applications WHERE id = ?');
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

            bot.sendMessage(chatId, details, { parse_mode: 'HTML' });
        }

        bot.answerCallbackQuery(query.id);
    }
});

function getStatusLabel(status) {
    const labels = {
        'new': '🆕 Новая',
        'accepted': '✅ Принята',
        'rejected': '❌ Отклонена',
        'completed': '✔️ Завершена'
    };
    return labels[status] || status;
}

// Bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `
👋 Привет! Я бот-администратор для сайта психотерапевта.

Доступные команды:
/stats - Статистика заявок
/new - Новые заявки
/help - Помощь
    `);
});

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    
    const stats = db.prepare(`
        SELECT 
            status,
            COUNT(*) as count
        FROM applications
        GROUP BY status
    `).all();

    const total = db.prepare('SELECT COUNT(*) as count FROM applications').get();

    let message = `📊 <b>Статистика заявок</b>\n\n`;
    message += `<b>Всего:</b> ${total.count}\n\n`;
    
    stats.forEach(stat => {
        message += `${getStatusLabel(stat.status)}: ${stat.count}\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

bot.onText(/\/new/, (msg) => {
    const chatId = msg.chat.id;
    
    const newApps = db.prepare(`
        SELECT * FROM applications 
        WHERE status = 'new' 
        ORDER BY created_at DESC 
        LIMIT 10
    `).all();

    if (newApps.length === 0) {
        bot.sendMessage(chatId, '✅ Нет новых заявок');
        return;
    }

    bot.sendMessage(chatId, `📋 <b>Новые заявки (${newApps.length}):</b>`, { parse_mode: 'HTML' });

    newApps.forEach(app => {
        notifyNewApplication(app);
    });
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `
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

console.log('✅ Telegram bot initialized');

module.exports = {
    bot,
    notifyNewApplication,
    stopPolling: () => bot.stopPolling()
};
