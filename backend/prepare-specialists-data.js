const fs = require('fs');
const path = require('path');

const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'specialists-content.md');

console.log('🚀 Подготовка данных специалистов из JSON\n');
console.log('='.repeat(70));

// Читаем данные
const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
const specialists = specialistsData.specialists;

console.log(`\n📋 Специалистов: ${specialists.length}\n`);

let mdContent = '# Контент специалистов\n\n';
mdContent += `Источник: specialists-data.json\n`;
mdContent += `Дата: ${new Date().toLocaleString('ru-RU')}\n\n`;
mdContent += '---\n\n';

specialists.forEach((spec, index) => {
    console.log(`[${index + 1}/${specialists.length}] ${spec.name}`);
    
    mdContent += `## ${spec.id}. ${spec.name}\n\n`;
    
    // Основная информация
    if (spec.role) {
        mdContent += `**Роль:** ${spec.role}\n\n`;
    }
    
    if (spec.experience) {
        mdContent += `**Опыт:** ${spec.experience} лет\n\n`;
    }
    
    if (spec.price) {
        mdContent += `**Цена:** ${spec.price} ₽\n\n`;
    }
    
    if (spec.duration) {
        mdContent += `**Длительность:** ${spec.duration}\n\n`;
    }
    
    if (spec.status) {
        mdContent += `**Статус:** ${spec.status}\n\n`;
    }
    
    // Специализации
    if (spec.specializations && spec.specializations.length > 0) {
        mdContent += `### Специализации\n\n`;
        spec.specializations.forEach(s => {
            mdContent += `- ${s}\n`;
        });
        mdContent += '\n';
    }
    
    // Методы терапии
    if (spec.therapyMethods && spec.therapyMethods.length > 0) {
        mdContent += `### Методы терапии\n\n`;
        spec.therapyMethods.forEach(m => {
            mdContent += `- ${m}\n`;
        });
        mdContent += '\n';
    }
    
    // Образование
    if (spec.education && spec.education.length > 0) {
        mdContent += `### Образование\n\n`;
        spec.education.forEach(e => {
            mdContent += `- ${e}\n`;
        });
        mdContent += '\n';
    }
    
    // Дополнительные услуги
    if (spec.additionalServices) {
        mdContent += `### Дополнительные услуги\n\n`;
        mdContent += `${spec.additionalServices}\n\n`;
    }
    
    // Отзывы
    if (spec.testimonials && spec.testimonials.length > 0) {
        mdContent += `### Отзывы\n\n`;
        spec.testimonials.forEach((t, idx) => {
            mdContent += `**Отзыв ${idx + 1}**\n\n`;
            mdContent += `> ${t.text}\n\n`;
            if (t.author) {
                mdContent += `*— ${t.author}*\n\n`;
            }
        });
    }
    
    mdContent += '---\n\n';
});

// Сохраняем
fs.writeFileSync(OUTPUT_FILE, mdContent, 'utf8');

console.log('\n' + '='.repeat(70));
console.log('📊 ИТОГИ:');
console.log(`   ✅ Обработано: ${specialists.length}`);
console.log(`   📄 Файл: ${OUTPUT_FILE}`);
console.log('='.repeat(70) + '\n');
console.log('🎉 Данные подготовлены!\n');
