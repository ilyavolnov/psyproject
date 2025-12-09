// Тестовый скрипт для проверки пароля
const bcrypt = require('bcrypt');

async function testPassword() {
    // Извлеченный хеш из базы данных
    const storedHash = '$2b$12$87UzKUzWIC4NFh5DPBjHReXg/Dr1CLPXQF6pJ.mfNfePOIOk3r/Yu';
    const testPassword = 'admin123';
    
    // Проверяем, совпадает ли пароль
    const isValid = await bcrypt.compare(testPassword, storedHash);
    console.log(`Пароль '${testPassword}' равен хешу в базе данных: ${isValid}`);
    
    // Попробуем неправильный пароль
    const wrongPassword = 'wrongpassword';
    const isWrongValid = await bcrypt.compare(wrongPassword, storedHash);
    console.log(`Пароль '${wrongPassword}' равен хешу в базе данных: ${isWrongValid}`);
}

testPassword();