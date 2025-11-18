// Demo API для Vercel - возвращает mock данные
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url.replace('/api/', '');
    
    // Mock данные для демонстрации
    const mockData = {
        'specialists': {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'Маргарита Румянцева',
                    specialization: 'Клинический психолог',
                    photo: '/images/specialists/rumyantseva.jpg',
                    experience: '10 лет',
                    education: 'МГУ им. М.В. Ломоносова'
                },
                {
                    id: 2,
                    name: 'Анна Белова',
                    specialization: 'Психотерапевт',
                    photo: '/images/specialists/anna_b.jpg',
                    experience: '8 лет',
                    education: 'СПбГУ'
                }
            ]
        },
        'courses': {
            success: true,
            data: [
                {
                    id: 1,
                    title: 'Курс РПП',
                    description: 'Расстройства пищевого поведения',
                    price: 25000,
                    duration: '3 месяца',
                    start_date: '2024-02-01'
                }
            ]
        },
        'supervisions': {
            success: true,
            data: [
                {
                    id: 1,
                    title: 'Индивидуальная супервизия',
                    description: 'Разбор сложных случаев',
                    price: 5000,
                    duration: '90 минут'
                }
            ]
        },
        'requests': {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'Иван Иванов',
                    phone: '+7 (999) 123-45-67',
                    email: 'ivan@example.com',
                    status: 'new',
                    created_at: new Date().toISOString()
                }
            ]
        },
        'promo-codes': {
            success: true,
            data: [
                {
                    id: 1,
                    code: 'WELCOME10',
                    discount: 10,
                    description: 'Скидка 10% для новых клиентов',
                    status: 'active'
                },
                {
                    id: 2,
                    code: 'SAVE20',
                    discount: 20,
                    description: 'Скидка 20%',
                    status: 'active'
                }
            ]
        },
        'settings': {
            success: true,
            data: {
                telegram_token: 'demo_token',
                admin_chat_id: 'demo_chat'
            }
        }
    };

    // Обработка POST запросов
    if (req.method === 'POST') {
        if (path.includes('validate')) {
            return res.json({
                success: true,
                data: { discount: 10, code: 'WELCOME10' }
            });
        }
        return res.json({ success: true, message: 'Demo: данные сохранены' });
    }

    // Обработка GET запросов
    const endpoint = path.split('/')[0].split('?')[0];
    const response = mockData[endpoint] || { 
        success: true, 
        message: 'Demo API',
        data: [] 
    };

    res.json(response);
};
