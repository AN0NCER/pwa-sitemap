const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let visitedLinks = new Set(); // Уникальные посещенные ссылки
  let scannedPagesCount = 0;
  
  let urlsToProcess = []; // Список URL для обработки

  // Функция для сокращения ссылки
  function shortenUrl(url) {
    return url.replace('https://an0ncer.github.io/', ''); // Удаление префикса
  }

  // Функция для загрузки списка посещенных URL из файла
  function loadVisitedLinks() {
    try {
      const data = fs.readFileSync('visitedLinks.json', 'utf8');
      return new Set(JSON.parse(data));
    } catch (err) {
      return new Set();
    }
  }

  // Функция для загрузки списка URL для обработки из файла
  function loadUrlsToProcess() {
    try {
      const data = fs.readFileSync('urlsToProcess.json', 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  // Функция для сохранения списка посещенных URL в файл
  function saveVisitedLinks() {
    fs.writeFileSync('visitedLinks.json', JSON.stringify([...visitedLinks]), 'utf8');
  }

  // Функция для сохранения списка URL для обработки в файл
  function saveUrlsToProcess() {
    // Фильтруем уникальные URL для обработки, оставляя только те, которых еще нет в посещенных
    const uniqueUrlsToProcess = [...new Set(urlsToProcess.filter(url => !visitedLinks.has(url)))];
    fs.writeFileSync('urlsToProcess.json', JSON.stringify(uniqueUrlsToProcess), 'utf8');
  }

  // Загружаем список посещенных URL при запуске скрипта
  visitedLinks = loadVisitedLinks();

  scannedPagesCount = visitedLinks.size;

  // Загружаем список URL для обработки при запуске скрипта
  urlsToProcess = loadUrlsToProcess();

  // Функция для рекурсивного сканирования страниц
  async function scanPage(url) {
    if (
      !visitedLinks.has(url) &&
      url.startsWith('https://an0ncer.github.io/') &&
      !url.includes('#') // Исключаем URL с символом "#"
    ) {
      visitedLinks.add(url); // Добавляем текущую ссылку в список посещенных
      scannedPagesCount++;

      await page.goto(url, { waitUntil: 'networkidle2' });

      // Получаем заголовок (title) текущей страницы
      const pageTitle = await page.title();

      // Очищаем строку и выводим текущую информацию о сканировании
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Заголовок страницы: ${pageTitle}\n`);
      process.stdout.write(`Сканируется страница: ${page.url()}\n`);
      process.stdout.write(chalk.black.bgGreen(`Сканировано: ${scannedPagesCount} - ${shortenUrl(page.url())} - ${pageTitle}`));

      // Получаем последнюю модификацию страницы
      const pageLastMod = new Date().toISOString();

      // Получаем ссылки с использованием JavaScript на текущей странице
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a');
        return Array.from(anchors).map(anchor => anchor.href);
      });

      // Добавляем найденные ссылки в общий массив, исключая пустые и с другим доменом
      for (const link of links) {
        if (link && link.startsWith('https://an0ncer.github.io/') && !visitedLinks.has(link)) {
          urlsToProcess.push(link); // Добавляем URL для обработки, если его еще нет в списке
          allLinks.push({ url: link, lastmod: pageLastMod, priority: 0.8 });
        }
      }

      // Рекурсивно сканируем каждую найденную ссылку
      for (const link of urlsToProcess) {
        await scanPage(link);
      }
    }
  }

  const allLinks = [];

  // Обработчик события SIGINT (Ctrl + C)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', async () => {
    rl.close();
    await saveDataAndExit();
  });

  // Начинаем сканирование с главной страницы или с URL-адресов, которые ожидают обработки
  if (urlsToProcess.length === 0) {
    urlsToProcess.push('https://an0ncer.github.io/');
  }

  for (const urlToProcess of urlsToProcess) {
    await scanPage(urlToProcess);
  }

  // Функция для сохранения данных и завершения работы
  async function saveDataAndExit() {
    console.log('\nСканирование остановлено. Сохранение данных...');
    // Закрываем браузер
    await browser.close();

    // Создаем sitemap.xml
    const allLinksArray = [...visitedLinks].map(link => ({
      url: link,
      lastmod: new Date().toISOString(),
      priority: 0.8,
    }));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allLinksArray.map(link => `
          <url>
            <loc>${link.url}</loc>
            <lastmod>${link.lastmod}</lastmod>
            <priority>${link.priority}</priority>
          </url>
        `).join('')}
      </urlset>`;

    // Записываем sitemap.xml в файл, убирая пустые строки
    fs.writeFileSync('sitemap.xml', sitemap.replace(/^\s*\n/gm, ''));

    // Сохраняем список посещенных URL в файл
    saveVisitedLinks();

    // Сохраняем список URL для обработки в файл без дубликатов
    saveUrlsToProcess();

    console.log('Sitemap.xml успешно создан.');
    process.exit(); // Завершаем выполнение скрипта
  }
})();