const { execSync } = require('child_process');
const fs = require('fs');

// Сначала проверим, запущен ли сервер
try {
    // Отправим тестовый запрос к API для проверки работоспособности
    const testReq = `
    curl -X POST http://localhost:3001/api/courses \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Тестовый курс для отладки",
        "subtitle": "Подзаголовок тестового курса",
        "description": "Описание тестового курса",
        "price": 5000,
        "status": "available",
        "image": "images/courses/test-course.jpg",
        "release_date": "15 ДЕКАБРЯ",
        "start_date": "2024-12-15T10:00:00",
        "access_duration": "3 недели",
        "feedback_duration": "Индивидуальное сопровождение",
        "has_certificate": true,
        "whatsapp_number": "89211880755",
        "bonuses": null,
        "materials": null,
        "topics": ["Тема 1", "Тема 2"],
        "author_name": "Маргарита Румянцева",
        "author_description": "Врач-психиатр, психотерапевт, сексолог",
        "page_blocks": "[]"
    }' 2>&1
    `;

    console.log("Отправляем тестовый запрос к API...");
    console.log("Команда:", testReq.replace(/\n/g, ' '));
    
    const result = execSync(testReq, { timeout: 10000, encoding: 'utf8' });
    console.log("Ответ от API:", result);
} catch (error) {
    console.error("Ошибка при тестировании API:", error.message);
    
    if (error.stdout) console.log("STDOUT:", error.stdout);
    if (error.stderr) console.log("STDERR:", error.stderr);
}