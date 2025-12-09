#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для выгрузки данных вебинаров из локальной базы данных
и сохранения их в txt-файлы с изображениями в соответствующих папках
"""
import os
import json
import sqlite3
import requests
from urllib.parse import urljoin, urlparse
from pathlib import Path
import re


def sanitize_filename(name):
    """Очистка названия вебинара для использования в качестве имени файла/папки"""
    # Удаляем или заменяем недопустимые символы в именах файлов
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', name)
    # Ограничиваем длину имени файла
    return sanitized[:100]  # Ограничиваем до 100 символов


def extract_image_urls_from_blocks(page_blocks_str):
    """Извлечение URL-адресов изображений из блоков страницы"""
    image_urls = []
    try:
        if page_blocks_str and page_blocks_str != '[]' and page_blocks_str != 'null':
            blocks = json.loads(page_blocks_str)
            for block in blocks:
                if 'data' in block:
                    data = block['data']
                    # Ищем изображения в различных полях блоков
                    for key, value in data.items():
                        if isinstance(value, str) and ('.jpg' in value or '.jpeg' in value or '.png' in value or '.webp' in value or '.gif' in value):
                            # Проверяем, что это действительно URL изображения
                            if any(ext in value.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                                image_urls.append(value)
                        elif isinstance(value, list):
                            # Если значение является списком, проверяем его элементы
                            for item in value:
                                if isinstance(item, str) and any(ext in item.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                                    image_urls.append(item)
    except Exception as e:
        print(f"Ошибка при извлечении изображений из блоков: {str(e)}")
    
    return image_urls


def download_image(image_url, save_path, session):
    """Скачивание изображения"""
    try:
        # Если URL начинается с ../../, это локальный путь, который нужно обработать
        if image_url.startswith('../../'):
            # Заменяем ../../ на корень проекта
            local_path = image_url[6:]  # Убираем '../../'
            local_full_path = Path(__file__).parent / local_path
            if local_full_path.exists():
                # Копируем локальный файл в нужное место
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                import shutil
                shutil.copy2(local_full_path, save_path)
                print(f"Скопировано локальное изображение: {save_path}")
                return True
            else:
                print(f"Локальный файл не найден: {local_path}")
                return False
        elif image_url.startswith('/'):
            # Это абсолютный путь на сервере, преобразуем в локальный путь
            local_path = image_url[1:]  # Убираем первый слэш
            local_full_path = Path(__file__).parent / local_path
            if local_full_path.exists():
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                import shutil
                shutil.copy2(local_full_path, save_path)
                print(f"Скопировано локальное изображение: {save_path}")
                return True
            else:
                print(f"Локальный файл не найден: {local_path}")
                return False
        else:
            # Это внешний URL, скачиваем как обычно
            response = session.get(image_url, stream=True, timeout=10)
            response.raise_for_status()
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"Скачано изображение: {save_path}")
            return True
    except Exception as e:
        print(f"Ошибка при скачивании изображения {image_url}: {str(e)}")
        return False


def export_webinars_to_files():
    """Экспорт вебинаров из базы данных в файлы"""
    # Подключаемся к базе данных
    conn = sqlite3.connect('./backend/database.sqlite')
    conn.row_factory = sqlite3.Row  # Для доступа к полям по имени
    cursor = conn.cursor()
    
    # Получаем все вебинары
    cursor.execute("SELECT * FROM courses WHERE type='webinar'")
    webinars = cursor.fetchall()
    
    if not webinars:
        print("В базе данных не найдено вебинаров")
        return
    
    print(f"Найдено вебинаров: {len(webinars)}")
    
    # Создаем основную папку для вебинаров
    base_path = Path("images/webinars")
    base_path.mkdir(parents=True, exist_ok=True)
    
    # Создаем сессию для скачивания изображений
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    for i, webinar in enumerate(webinars):
        print(f"\nОбработка вебинара: {webinar['title']}")
        
        # Очищаем название для использования в файловой системе
        sanitized_title = sanitize_filename(webinar['title'])
        
        # Создаем папку для этого вебинара
        webinar_dir = base_path / sanitized_title
        webinar_dir.mkdir(exist_ok=True)
        
        # Создаем текстовый контент из данных вебинара
        content = []
        content.append(f"ID: {webinar['id']}")
        content.append(f"Название: {webinar['title']}")
        content.append(f"Подзаголовок: {webinar['subtitle']}")
        content.append(f"Описание: {webinar['description']}")
        content.append(f"Цена: {webinar['price']}")
        content.append(f"Статус: {webinar['status']}")
        content.append(f"Дата релиза: {webinar['release_date']}")
        content.append(f"Длительность доступа: {webinar['access_duration']}")
        content.append(f"Обратная связь: {webinar['feedback_duration']}")
        content.append(f"Выдается сертификат: {bool(webinar['has_certificate'])}")
        content.append(f"WhatsApp: {webinar['whatsapp_number']}")
        content.append(f"Темы: {webinar['topics']}")
        content.append(f"Автор: {webinar['author_name']}")
        content.append(f"Описание автора: {webinar['author_description']}")
        content.append(f"Тип: {webinar['type']}")
        content.append(f"Slug: {webinar['slug']}")
        content.append(f"Дата начала: {webinar['start_date']}")
        
        # Добавляем данные блоков страницы
        content.append(f"\nБлоки страницы: {webinar['page_blocks']}")
        
        # Сохраняем текстовый контент в txt файл
        txt_path = webinar_dir / "content.txt"
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(content))
        
        print(f"Сохранен текстовый контент вебинара: {txt_path}")
        
        # Извлекаем и скачиваем изображения
        image_urls = []
        
        # Извлекаем изображения из главного поля image
        if webinar['image']:
            image_urls.append(webinar['image'])
        
        # Извлекаем изображения из блоков страницы
        if webinar['page_blocks'] and webinar['page_blocks'] != '[]':
            block_images = extract_image_urls_from_blocks(webinar['page_blocks'])
            image_urls.extend(block_images)
        
        print(f"Найдено изображений для вебинара '{webinar['title']}': {len(image_urls)}")
        
        # Скачиваем изображения
        for j, img_url in enumerate(image_urls, start=1):
            # Определяем расширение файла
            parsed_url = urlparse(img_url)
            img_ext = os.path.splitext(parsed_url.path)[1] or '.jpg'
            if not img_ext:
                img_ext = '.jpg'  # по умолчанию jpg
            
            img_filename = f"{j:03d}{img_ext}"
            img_path = webinar_dir / img_filename
            
            if download_image(img_url, img_path, session):
                print(f"Изображение {j} сохранено: {img_path}")
        
        print(f"Вебинар '{webinar['title']}' обработан")
    
    # Закрываем соединение с базой данных
    conn.close()
    
    print(f"\nЭкспорт завершен. Данные вебинаров сохранены в папке: {base_path}")


if __name__ == "__main__":
    export_webinars_to_files()