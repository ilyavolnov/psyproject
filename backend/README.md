# Backend для сайта психотерапевта

Backend с Telegram ботом для управления заявками.

## Возможности

- 📝 Прием заявок с сайта через API
- 📱 Telegram бот для уведомлений админа
- ✅ Быстрое принятие/отклонение заявок через кнопки
- 📊 Статистика заявок
- 🗄️ SQLite база данных

## Установка

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Создайте Telegram бота:
   - Откройте [@BotFather](https://t.me/botfather) в Telegram
   - Отправьте `/newbot`
   - Следуйте инструкциям
   - Скопируйте токен бота

3. Получите свой Telegram ID:
   - Откройте [@userinfobot](https://t.me/userinfobot)
   - Отправьте `/start`
   - Скопируйте ваш ID

4. Создайте файл `.env`:
```bash
cp .env.example .env
```

5. Заполните `.env`:
```env
PORT=3000
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_ADMIN_ID=ваш_telegram_id
ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com
```

## Запуск

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### POST /api/applications
Создать новую заявку

**Body:**
```json
{
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "email": "ivan@example.com",
  "requestType": "urgent",
  "message": "Нужна консультация",
  "specialistId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": 1
}
```

### GET /api/applications
Получить список заявок

**Query params:**
- `status` - фильтр по статусу (new, accepted, rejected, completed)
- `limit` - количество записей (по умолчанию 50)
- `offset` - смещение для пагинации

### GET /api/specialists
Получить список специалистов

**Query params:**
- `status` - фильтр по статусу (available, waiting, full)

## Telegram Bot команды

- `/start` - Начать работу с ботом
- `/stats` - Статистика заявок
- `/new` - Показать новые заявки
- `/help` - Справка

## Интеграция с фронтендом

Обновите файл `consultation-popup.js`:

```javascript
// Отправка формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        requestType: document.getElementById('requestType').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Заявка успешно отправлена!');
            form.reset();
            closePopup();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при отправке заявки');
    }
});
```

## Деплой

### На VPS (Ubuntu)

1. Установите Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Клонируйте репозиторий и установите зависимости

3. Используйте PM2 для запуска:
```bash
sudo npm install -g pm2
pm2 start server.js --name psyproject-backend
pm2 save
pm2 startup
```

### На Heroku

1. Создайте `Procfile`:
```
web: node server.js
```

2. Деплой:
```bash
heroku create your-app-name
git push heroku main
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set TELEGRAM_ADMIN_ID=your_id
```

## Структура проекта

```
backend/
├── server.js           # Главный файл сервера
├── database.js         # Инициализация БД
├── bot.js             # Telegram бот
├── routes/
│   └── api.js         # API роуты
├── package.json
├── .env.example
└── README.md
```

## Следующие шаги

- [ ] Добавить Telegram Web App для управления специалистами
- [ ] Добавить аутентификацию для API
- [ ] Добавить email уведомления
- [ ] Добавить экспорт заявок в Excel
- [ ] Добавить интеграцию с календарем
