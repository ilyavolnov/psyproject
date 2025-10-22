# Инструкция по обновлению Header и Footer

## Что сделано:

✅ Создан `includes/header.html` - отдельный файл с header  
✅ Создан `includes/footer.html` - отдельный файл с footer  
✅ Создан `includes/load-components.js` - скрипт для автоматической загрузки компонентов  
✅ Обновлен `specialists.html` - использует новые компоненты  
✅ Частично обновлен `index.html` - header заменен, footer нужно доделать вручную

## Что нужно сделать вручную:

### Для index.html:
1. Найти и удалить весь блок footer (от `<footer class="footer">` до `</footer>`)
2. Убедиться что есть `<div id="footer-placeholder"></div>` перед Hover Card
3. Убедиться что есть `<script src="includes/load-components.js"></script>` перед script.js

### Для specialist-profile.html:
1. Заменить `<header>...</header>` на `<div id="header-placeholder"></div>`
2. Заменить `<footer>...</footer>` на `<div id="footer-placeholder"></div>`
3. Добавить перед другими скриптами: `<script src="includes/load-components.js"></script>`

### Для supervision.html:
1. Найти и удалить весь блок footer (от `<footer class="footer">` до `</footer>`)
2. Убедиться что есть `<div id="footer-placeholder"></div>`
3. Убедиться что есть `<script src="includes/load-components.js"></script>`

## Преимущества:

- Header и Footer в одном месте (`includes/header.html` и `includes/footer.html`)
- Изменения применяются ко всем страницам автоматически
- Легче поддерживать и обновлять
- Меньше дублирования кода

## Как это работает:

Скрипт `includes/load-components.js` автоматически загружает содержимое header.html и footer.html в соответствующие placeholder'ы на каждой странице при загрузке.
