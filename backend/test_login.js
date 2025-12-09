#!/usr/bin/env node

// Тестовый скрипт для проверки API авторизации
const https = require('https');
const http = require('http');

const testData = {
    username: 'admin',
    password: 'admin123'
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`Статус ответа: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
        console.log(`Тело ответа: ${chunk}`);
    });
    
    res.on('end', () => {
        console.log('Запрос завершен');
    });
});

req.on('error', (e) => {
    console.error(`Ошибка запроса: ${e.message}`);
});

req.write(postData);
req.end();