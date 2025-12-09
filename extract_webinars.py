#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для выгрузки данных вебинаров с сайта https://dr-rumyantceva.ru/vebinary/
Сохраняет текстовый контент вебинаров в txt-файлы и изображения в папку images/webinars/
"""

import os
import re
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time
from pathlib import Path


def sanitize_filename(name):
    """Очистка названия вебинара для использования в качестве имени файла/папки"""
    # Удаляем или заменяем недопустимые символы в именах файлов
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', name)
    # Ограничиваем длину имени файла
    return sanitized[:100]  # Ограничиваем до 100 символов


def download_image(image_url, save_path, session):
    """Скачивание изображения"""
    try:
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


def extract_webinar_data(webinar_url, session):
    """Извлечение данных одного вебинара"""
    try:
        response = session.get(webinar_url)
        response.raise_for_status()
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Удаляем script и style элементы
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Получаем название вебинара - обычно это заголовок h1 или h2
        title_elem = soup.find(['h1', 'h2', '.title', '.webinar-title'])
        if title_elem:
            title = title_elem.get_text(strip=True)
        else:
            title = urlparse(webinar_url).path.split('/')[-1] or "Вебинар без названия"
        
        # Если имя слишком короткое, пытаемся получить из заголовка страницы
        if len(title) < 5:
            title_elem = soup.find('title')
            if title_elem:
                title = title_elem.get_text(strip=True)
        
        sanitized_title = sanitize_filename(title)
        
        # Извлекаем текстовый контент
        # Убираем лишние пробелы и очищаем текст
        text_content = soup.get_text()
        lines = (line.strip() for line in text_content.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text_content = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Находим все изображения
        images = []
        img_tags = soup.find_all('img')
        
        for i, img_tag in enumerate(img_tags, start=1):
            img_src = img_tag.get('src') or img_tag.get('data-src')  # Обработка lazy loading
            if img_src:
                # Преобразуем относительный URL в абсолютный
                full_img_url = urljoin(webinar_url, img_src)
                images.append(full_img_url)
        
        return {
            'title': title,
            'sanitized_title': sanitized_title,
            'content': text_content,
            'images': images,
            'url': webinar_url
        }
    except Exception as e:
        print(f"Ошибка при извлечении данных вебинара {webinar_url}: {str(e)}")
        return None


def get_webinar_list(base_url, session):
    """Получение списка вебинаров с главной страницы"""
    try:
        response = session.get(base_url)
        response.raise_for_status()
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Находим все возможные ссылки на вебинары
        # Обычно это ссылки в определенных классах или структурах
        webinar_links = set()
        
        # Ищем ссылки с различными подходящими селекторами
        link_selectors = [
            'a[href*="vebinary"]',  # Ссылки с вебинарами в URL
            '.webinar-link',        # Классы, вероятно используемые для вебинаров
            '.course-link',         # Также могут использоваться для курсов/вебинаров
            'a[href^="/vebinary/"]', # Относительные ссылки на вебинары
            '.card a',              # Ссылки в карточках
            '.item a'               # Ссылки в элементах
        ]
        
        for selector in link_selectors:
            for link in soup.select(selector):
                href = link.get('href')
                if href:
                    full_url = urljoin(base_url, href)
                    if 'vebinary' in full_url:  # Фильтруем только вебинары
                        webinar_links.add(full_url)
        
        # Также ищем все ссылки на вебинары в тексте
        for link in soup.find_all('a', href=True):
            href = link['href']
            if 'vebinary' in href:
                full_url = urljoin(base_url, href)
                webinar_links.add(full_url)
        
        print(f"Найдено {len(webinar_links)} потенциальных вебинаров")
        return list(webinar_links)
    
    except Exception as e:
        print(f"Ошибка при получении списка вебинаров: {str(e)}")
        return []


def main():
    base_url = "https://dr-rumyantceva.ru/vebinary/"
    
    # Создаем сессию для повторных запросов
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    print("Получение списка вебинаров...")
    webinar_urls = get_webinar_list(base_url, session)
    
    if not webinar_urls:
        print("Не удалось найти вебинары на странице")
        return
    
    # Создаем основную папку для вебинаров
    base_path = Path("images/webinars")
    base_path.mkdir(parents=True, exist_ok=True)
    
    webinar_count = 0
    
    for webinar_url in webinar_urls:
        print(f"\nОбработка вебинара: {webinar_url}")
        
        webinar_data = extract_webinar_data(webinar_url, session)
        
        if webinar_data:
            webinar_count += 1
            title = webinar_data['sanitized_title']
            content = webinar_data['content']
            images = webinar_data['images']
            
            # Создаем папку для этого вебинара
            webinar_dir = base_path / title
            webinar_dir.mkdir(exist_ok=True)
            
            # Сохраняем текстовый контент в txt файл
            txt_path = webinar_dir / "content.txt"
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(f"URL: {webinar_data['url']}\n")
                f.write(f"Название: {webinar_data['title']}\n")
                f.write("="*50 + "\n\n")
                f.write(content)
            
            print(f"Сохранен текстовый контент вебинара: {txt_path}")
            
            # Скачиваем изображения
            for i, img_url in enumerate(images, start=1):
                img_ext = os.path.splitext(urlparse(img_url).path)[1] or '.jpg'
                if not img_ext:
                    img_ext = '.jpg'  # по умолчанию jpg
                
                img_filename = f"{i:03d}{img_ext}"
                img_path = webinar_dir / img_filename
                
                if download_image(img_url, img_path, session):
                    print(f"Изображение {i} сохранено: {img_path}")
            
            # Пауза между запросами, чтобы не перегружать сервер
            time.sleep(1)
    
    print(f"\nОбработка завершена. Обработано вебинаров: {webinar_count}")
    print(f"Данные сохранены в папке: {base_path}")


if __name__ == "__main__":
    main()