#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для создания вебинаров с изображениями и блоками в базе данных
"""

import sqlite3
import json
import os
from pathlib import Path
import requests
from urllib.parse import urljoin
import random


def create_webinar_images_dir():
    """Создаем директорию для изображений вебинаров"""
    webinars_img_dir = Path("images/webinars")
    webinars_img_dir.mkdir(parents=True, exist_ok=True)
    return webinars_img_dir


def download_image_from_source(url, local_path):
    """Скачиваем изображение из внешнего источника или копируем локальное"""
    try:
        # Если URL начинается с http, скачиваем
        if url.startswith('http'):
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Скачано изображение: {local_path}")
        else:
            # Если это локальный путь - копируем
            source_path = Path(url)
            if source_path.exists():
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                import shutil
                shutil.copy2(source_path, local_path)
                print(f"Скопировано изображение: {local_path}")
            else:
                print(f"Изображение не найдено: {url}")
    except Exception as e:
        print(f"Ошибка при скачивании изображения {url}: {str(e)}")


def create_sample_webinars():
    """Создаем примеры вебинаров с изображениями и блоками"""
    
    # Создаем папку для изображений вебинаров
    webinars_img_dir = create_webinar_images_dir()
    
    # Определяем возможные изображения для вебинаров (используем существующее изображение из проекта)
    sample_images = [
        'images/hero-page.webp',  # Используем существующее изображение из проекта
        'images/consultation-bg.webp',
        'images/supervision-bg.webp'
    ]
    
    # Проверяем, какие изображения существуют и используем их
    existing_images = [img for img in sample_images if Path(img).exists()]
    if not existing_images:
        # Если нет существующих изображений, создаем условное изображение
        existing_images = ['images/hero-page.webp']  # Берем стандартное изображение
    
    sample_webinars = [
        {
            "title": "Основы психотерапии в работе с тревожными расстройствами",
            "subtitle": "Практический вебинар для начинающих специалистов",
            "description": "Вебинар посвящен основам работы с тревожными расстройствами в психотерапии. Участники узнают о современных подходах, методах диагностики и техниках вмешательства.",
            "price": 4900,
            "status": "available",
            "image": random.choice(existing_images),
            "release_date": "15 ДЕКАБРЯ",
            "access_duration": "4 недели",
            "feedback_duration": "Индивидуальные консультации",
            "has_certificate": True,
            "whatsapp_number": "89211880755",
            "topics": [
                "Что такое тревожные расстройства",
                "Диагностика и дифференциация",
                "Когнитивно-поведенческий подход",
                "Работа с телесными проявлениями"
            ],
            "author_name": "Маргарита Румянцева",
            "author_description": "Врач-психиатр, психотерапевт, сексолог (стаж с 2009 г.)",
            "start_date": "2024-12-20T15:00:00",
            "type": "webinar",
            "page_blocks": [
                {
                    "type": "hero",
                    "data": {
                        "image": random.choice(existing_images),
                        "title": "Основы психотерапии в работе с тревожными расстройствами",
                        "price": 4900,
                        "startDate": "15 ДЕКАБРЯ",
                        "paymentInstructions": "Оплата через WhatsApp: 89211880755"
                    }
                },
                {
                    "type": "description",
                    "data": {
                        "image": random.choice(existing_images),
                        "title": "О вебинаре",
                        "subtitle": "Практический вебинар для начинающих специалистов",
                        "contentType": "Лекция + практические упражнения"
                    }
                },
                {
                    "type": "program",
                    "data": {
                        "title": "Программа вебинара",
                        "items": [
                            "Что такое тревожные расстройства",
                            "Диагностика и дифференциация",
                            "Когнитивно-поведенческий подход",
                            "Работа с телесными проявлениями",
                            "Управление сопротивлением",
                            "Завершение терапии"
                        ]
                    }
                },
                {
                    "type": "features",
                    "data": {
                        "image": random.choice(existing_images),
                        "imagePosition": "left",
                        "title": "Преимущества участия",
                        "items": [
                            "Практические навыки",
                            "Разбор кейсов",
                            "Методические материалы",
                            "Сертификат участника"
                        ]
                    }
                },
                {
                    "type": "author",
                    "data": {
                        "photo": random.choice(existing_images),
                        "name": "Маргарита Румянцева",
                        "credentials": [
                            "Врач-психиатр",
                            "Психотерапевт",
                            "Сексолог",
                            "EMDR-терапевт"
                        ]
                    }
                }
            ]
        },
        {
            "title": "Работа с травмой в EMDR-подходе",
            "subtitle": "Продвинутый вебинар для практикующих терапевтов",
            "description": "Вебинар посвящен глубокой работе с травмой с использованием EMDR-подхода. Участники получат практические навыки и разберут сложные клинические случаи.",
            "price": 8900,
            "status": "available",
            "image": random.choice(existing_images),
            "release_date": "22 ДЕКАБРЯ",
            "access_duration": "6 недель",
            "feedback_duration": "Групповая супервизия",
            "has_certificate": True,
            "whatsapp_number": "89211880755",
            "topics": [
                "Основы EMDR-терапии",
                "Работа с комплексной травмой",
                "Техники стабилизации",
                "Работа с диссоциацией",
                "Терапевтические отношения"
            ],
            "author_name": "Маргарита Румянцева",
            "author_description": "Врач-психиатр, психотерапевт, сексолог (стаж с 2009 г.)",
            "start_date": "2024-12-25T18:00:00",
            "type": "webinar",
            "page_blocks": [
                {
                    "type": "hero",
                    "data": {
                        "image": random.choice(existing_images),
                        "title": "Работа с травмой в EMDR-подходе",
                        "price": 8900,
                        "startDate": "22 ДЕКАБРЯ",
                        "paymentInstructions": "Оплата через WhatsApp: 89211880755"
                    }
                },
                {
                    "type": "description",
                    "data": {
                        "image": random.choice(existing_images),
                        "title": "О вебинаре",
                        "subtitle": "Продвинутый вебинар для практикующих терапевтов",
                        "contentType": "Мастер-класс + практика"
                    }
                },
                {
                    "type": "program",
                    "data": {
                        "title": "Программа вебинара",
                        "items": [
                            "Основы EMDR-терапии",
                            "Оценка травмы",
                            "Подготовка клиента",
                            "Работа с диссоциацией",
                            "Завершение обработки",
                            "Интеграция ресурсов"
                        ]
                    }
                },
                {
                    "type": "author",
                    "data": {
                        "photo": random.choice(existing_images),
                        "name": "Маргарита Румянцева",
                        "credentials": [
                            "Врач-психиатр",
                            "EMDR-терапевт",
                            "Психотерапевт",
                            "Супервизор"
                        ]
                    }
                }
            ]
        },
        {
            "title": "Психотерапия в работе с эмоциональным выгоранием",
            "subtitle": "Вебинар для специалистов и HR-менеджеров",
            "description": "Узнайте, как распознавать и работать с эмоциональным выгоранием у себя и клиентов. Практические инструменты и методы профилактики.",
            "price": 3900,
            "status": "available",
            "image": random.choice(existing_images),
            "release_date": "28 ДЕКАБРЯ",
            "access_duration": "3 недели",
            "feedback_duration": "Индивидуальные консультации",
            "has_certificate": True,
            "whatsapp_number": "89211880755",
            "topics": [
                "Симптомы эмоционального выгорания",
                "Различие с депрессией и тревогой",
                "Факторы риска",
                "Профилактика и восстановление",
                "Работа с профессиональными группами"
            ],
            "author_name": "Маргарита Румянцева",
            "author_description": "Врач-психиатр, психотерапевт, сексолог (стаж с 2009 г.)",
            "start_date": "2024-12-30T16:00:00",
            "type": "webinar",
            "page_blocks": [
                {
                    "type": "hero",
                    "data": {
                        "image": random.choice(existing_images),
                        "title": "Психотерапия в работе с эмоциональным выгоранием",
                        "price": 3900,
                        "startDate": "28 ДЕКАБРЯ",
                        "paymentInstructions": "Оплата через WhatsApp: 89211880755"
                    }
                },
                {
                    "type": "features",
                    "data": {
                        "image": random.choice(existing_images),
                        "imagePosition": "right",
                        "title": "Что вы получите",
                        "items": [
                            "Распознавание признаков выгорания",
                            "Методы диагностики",
                            "Техники восстановления",
                            "Профилактические стратегии"
                        ]
                    }
                },
                {
                    "type": "program",
                    "data": {
                        "title": "Программа вебинара",
                        "items": [
                            "Что такое эмоциональное выгорание",
                            "Диагностика и оценка",
                            "Индивидуальные особенности",
                            "Работа с профессионалами",
                            "Профилактика и самопомощь"
                        ]
                    }
                },
                {
                    "type": "author",
                    "data": {
                        "photo": random.choice(existing_images),
                        "name": "Маргарита Румянцева",
                        "credentials": [
                            "Психотерапевт",
                            "Сексолог",
                            "EMDR-терапевт",
                            "Преподаватель"
                        ]
                    }
                }
            ]
        }
    ]
    
    return sample_webinars


def insert_webinars_to_database():
    """Добавляем вебинары в базу данных"""
    
    # Получаем примеры вебинаров
    webinars = create_sample_webinars()
    
    # Подключаемся к базе данных
    conn = sqlite3.connect('./backend/database.sqlite')
    cursor = conn.cursor()
    
    # Удаление существующих вебинаров (опционально, для чистоты данных)
    cursor.execute("DELETE FROM courses WHERE type='webinar'")
    
    for webinar in webinars:
        # Генерируем slug из названия
        slug = webinar['title'].lower().replace(' ', '-').replace(',', '').replace('(', '').replace(')', '')
        
        # Подготовка данных
        page_blocks_json = json.dumps(webinar['page_blocks'], ensure_ascii=False)
        topics_json = json.dumps(webinar['topics'], ensure_ascii=False)
        
        # SQL запрос для вставки данных
        cursor.execute('''
            INSERT INTO courses (
                title, subtitle, description, price, status, image, release_date,
                access_duration, feedback_duration, has_certificate, whatsapp_number,
                topics, author_name, author_description, start_date, type, slug, page_blocks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            webinar['title'],
            webinar['subtitle'],
            webinar['description'],
            webinar['price'],
            webinar['status'],
            webinar['image'],
            webinar['release_date'],
            webinar['access_duration'],
            webinar['feedback_duration'],
            webinar['has_certificate'],
            webinar['whatsapp_number'],
            topics_json,
            webinar['author_name'],
            webinar['author_description'],
            webinar['start_date'],
            webinar['type'],
            slug,
            page_blocks_json
        ))
    
    # Сохраняем изменения
    conn.commit()
    
    # Закрываем соединение
    conn.close()
    
    print(f"Добавлено {len(webinars)} вебинаров в базу данных")
    return webinars


if __name__ == "__main__":
    webinars = insert_webinars_to_database()
    for webinar in webinars:
        print(f"Создан вебинар: {webinar['title']}")