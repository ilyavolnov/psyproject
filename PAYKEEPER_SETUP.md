# Настройка интеграции PayKeeper

## 1. Получение данных от клиента

Попросите клиента предоставить из личного кабинета PayKeeper:

1. **URL сервера** (например: `https://client.paykeeper.ru`)
2. **Логин** для API
3. **Пароль** для API
4. **Секретный ключ** (для проверки подписи webhook)

## 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
PAYKEEPER_SERVER=https://client.paykeeper.ru
PAYKEEPER_USER=api_user
PAYKEEPER_PASSWORD=api_password
PAYKEEPER_SECRET=your_secret_key
```

## 3. Установка зависимости

```bash
npm install dotenv
```

## 4. Обновление server.js

Добавьте в начало `backend/server.js`:

```javascript
require('dotenv').config();
```

## 5. Настройка webhook в PayKeeper

В личном кабинете PayKeeper настройте webhook:

**URL webhook:** `https://ваш-домен.ru/api/paykeeper/webhook`

**Метод:** POST

**События:** Успешная оплата

## 6. Подключение на страницах

### Для страницы курса (course-page.html):

Добавьте перед закрывающим `</body>`:

```html
<script src="../../payment-handler.js"></script>
```

Измените кнопку "Оплатить":

```javascript
button.onclick = () => {
    window.paymentHandler.showPaymentForm(course, 'course');
};
```

### Для страницы супервизий:

В `pages/supervisions/supervision-popup.js` измените кнопку оплаты:

```javascript
payButton.onclick = () => {
    closeSupervisionPopup();
    window.paymentHandler.showPaymentForm(supervision, 'supervision');
};
```

## 7. Тестирование

### Тестовый режим:

PayKeeper предоставляет тестовые карты:
- **Успешная оплата:** 4242 4242 4242 4242
- **Отклонение:** 4000 0000 0000 0002

### Проверка:

1. Создайте тестовый платеж
2. Оплатите тестовой картой
3. Проверьте, что webhook получен (логи в консоли сервера)
4. Проверьте статус в базе данных:

```bash
sqlite3 backend/database.sqlite "SELECT * FROM payments;"
```

## 8. Переход на боевой режим

1. Замените тестовые данные на боевые в `.env`
2. Убедитесь, что webhook настроен на боевой домен
3. Проверьте SSL сертификат на сайте (обязательно HTTPS)

## 9. Дополнительные возможности

### Применение промокодов:

Модифицируйте `createCoursePayment` для учета скидки:

```javascript
const discount = await applyPromoCode(promoCode);
const finalAmount = course.price - discount;
```

### Автоматическая выдача доступа:

В webhook обработчике добавьте логику:

```javascript
// После подтверждения оплаты
if (payment.course_id) {
    await grantCourseAccess(payment.client_email, payment.course_id);
}
```

### Email уведомления:

Отправляйте письма после успешной оплаты:

```javascript
await sendPaymentConfirmation(payment.client_email, payment);
```

## 10. Мониторинг

Проверяйте логи платежей:

```bash
# Все платежи
sqlite3 backend/database.sqlite "SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;"

# Успешные платежи
sqlite3 backend/database.sqlite "SELECT * FROM payments WHERE status='paid';"

# Ожидающие платежи
sqlite3 backend/database.sqlite "SELECT * FROM payments WHERE status='pending';"
```

## Поддержка

Документация PayKeeper: https://paykeeper.ru/docs/
Техподдержка: support@paykeeper.ru
