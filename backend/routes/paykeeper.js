const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { prepare, saveDatabase } = require('../database');

// PayKeeper configuration (должны быть в .env файле)
const PAYKEEPER_SERVER = process.env.PAYKEEPER_SERVER || 'https://demo.paykeeper.ru';
const PAYKEEPER_USER = process.env.PAYKEEPER_USER || '';
const PAYKEEPER_PASSWORD = process.env.PAYKEEPER_PASSWORD || '';
const PAYKEEPER_SECRET = process.env.PAYKEEPER_SECRET || '';

// Получить токен для создания счета
async function getPayKeeperToken() {
    try {
        const response = await fetch(`${PAYKEEPER_SERVER}/info/settings/token/`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${PAYKEEPER_USER}:${PAYKEEPER_PASSWORD}`).toString('base64')
            }
        });
        
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error getting PayKeeper token:', error);
        throw error;
    }
}

// Создать счет на оплату
router.post('/create-invoice', async (req, res) => {
    try {
        const { 
            amount, 
            orderid, 
            clientid, 
            service_name, 
            client_email, 
            client_phone 
        } = req.body;

        // Получаем токен
        const token = await getPayKeeperToken();

        // Формируем данные для счета
        const invoiceData = new URLSearchParams({
            pay_amount: amount,
            clientid: clientid || client_email,
            orderid: orderid,
            service_name: service_name,
            client_email: client_email || '',
            client_phone: client_phone || '',
            token: token
        });

        // Создаем счет
        const response = await fetch(`${PAYKEEPER_SERVER}/change/invoice/preview/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: invoiceData
        });

        const result = await response.json();

        if (result.invoice_id) {
            // Сохраняем информацию о платеже в БД
            await prepare(`
                INSERT INTO payments (
                    invoice_id, order_id, amount, status, 
                    client_email, service_name, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            `).run(
                result.invoice_id,
                orderid,
                amount,
                'pending',
                client_email,
                service_name
            );

            saveDatabase();

            // Формируем URL для оплаты
            const paymentUrl = `${PAYKEEPER_SERVER}/bill/${result.invoice_id}/`;

            res.json({
                success: true,
                invoice_id: result.invoice_id,
                payment_url: paymentUrl
            });
        } else {
            throw new Error('Failed to create invoice');
        }
    } catch (error) {
        console.error('Error creating PayKeeper invoice:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Webhook для получения уведомлений о платежах
router.post('/webhook', async (req, res) => {
    try {
        const {
            id,
            sum,
            orderid,
            clientid,
            service_name,
            key
        } = req.body;

        // Проверяем подпись
        const signString = `${id}${sum}${clientid}${orderid}${PAYKEEPER_SECRET}`;
        const expectedKey = crypto.createHash('md5').update(signString).digest('hex');

        if (key !== expectedKey) {
            console.error('Invalid signature');
            return res.status(403).send('Invalid signature');
        }

        // Обновляем статус платежа в БД
        await prepare(`
            UPDATE payments 
            SET status = 'paid', paid_at = datetime('now')
            WHERE order_id = ?
        `).run(orderid);

        saveDatabase();

        // Можно отправить уведомление клиенту, обновить доступ к курсу и т.д.
        console.log(`Payment confirmed: Order ${orderid}, Amount ${sum}`);

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error');
    }
});

// Проверить статус платежа
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const payment = await prepare(`
            SELECT * FROM payments WHERE order_id = ?
        `).get(orderId);

        if (payment) {
            res.json({
                success: true,
                status: payment.status,
                amount: payment.amount,
                paid_at: payment.paid_at
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
