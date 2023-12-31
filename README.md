# Web Scraper с использованием Puppeteer

Этот скрипт представляет собой пример веб-скрапера, который использует библиотеку Puppeteer для сканирования веб-сайта и создания sitemap.xml. Скрипт может быть использован для анализа структуры сайта и получения списка URL-адресов для индексации.

## Зависимости

Для использования этого скрипта вам понадобятся следующие зависимости:

- [Puppeteer](https://github.com/puppeteer/puppeteer): Библиотека для управления браузером Chrome/Chromium с помощью JavaScript.
- [Node.js](https://nodejs.org/): Среда выполнения JavaScript на сервере.

## Установка

1. Установите Node.js, если он еще не установлен на вашем компьютере.
2. Склонируйте данный репозиторий с помощью команды `git clone`.
3. В терминале перейдите в папку с репозиторием и выполните команду `npm install` для установки зависимостей.

## Использование

1. Запустите скрипт с помощью команды `node scraper.js`.
2. Скрипт начнет сканирование сайта с указанной главной страницы или с URL-адресов, которые ожидают обработки.
3. Во время сканирования скрипт выводит информацию о прогрессе и посещенных страницах.
4. Когда сканирование завершено или вы останавливаете его (нажмите `Ctrl + C`), скрипт создаст файл `sitemap.xml`, который содержит список URL-адресов сайта в формате sitemap.

## Файлы

- `scraper.js`: Главный файл скрипта.
- `visitedLinks.json`: Список посещенных URL.
- `urlsToProcess.json`: Список URL для обработки.
- `sitemap.xml`: Сгенерированный файл sitemap.

## Примечания

- Этот скрипт сконфигурирован для сканирования сайта, начиная с главной страницы `https://an0ncer.github.io/`. Вы можете изменить начальную страницу в коде, если необходимо сканировать другой сайт.
- Скрипт сохраняет список посещенных URL и URL для обработки в файлы, чтобы можно было продолжить сканирование позже.
- Уровень приоритета (`priority`) для каждого URL в sitemap.xml установлен на 0.8, но вы можете настроить это значение в соответствии с вашими требованиями.

## Лицензия

Этот скрипт распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).

