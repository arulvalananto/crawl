const puppeteer = require('puppeteer');

const Web = require('../Web');
const AxiosInstance = require('../axios');
const constants = require('../constants');
const { initializeBrowser } = require('../browserInstance');

class DevTo {
    constructor(url) {
        this.url = url;
    }

    async getTrendingArticles(
        count = constants.DEFAULT_ARTICLE_COUNT,
        options = { headless: 'new', devtools: false, url: '', additional: 14 }
    ) {
        const browser = await initializeBrowser();

        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });

        const baseUrl = options.url ? options.url : this.url;
        await page.goto(baseUrl);

        const articles = [];

        for (let i = 2; i <= count + options.additional; i++) {
            const path = `/html/body/div[7]/div/div[2]/main/div[3]/div[${i}]`;

            const titleElementXPath = `${path}/a`;
            const linkElementXPath = `${path}/a`;
            const creatorNameElementXPath = `${path}/div/div[1]/div/div[2]/div/div/button`;
            const readingTimeElementXPath = `${path}/div/div[2]/div[2]/div[2]/small`;

            const titleElement = await page.$x(titleElementXPath);

            const title = await page.evaluate(
                (el) => el?.innerText,
                titleElement ? titleElement[0] : null
            );

            const linkElement = await page.$x(linkElementXPath);
            const link = await page.evaluate((el) => el?.href, linkElement[0]);

            const creatorNameElement = await page.$x(creatorNameElementXPath);
            const creatorName = await page.evaluate(
                (el) => el?.innerText,
                creatorNameElement ? creatorNameElement[0] : null
            );

            const readingTimeElement = await page.$x(readingTimeElementXPath);
            const readingTime = await page.evaluate(
                (el) => el?.innerText,
                readingTimeElement ? readingTimeElement[0] : null
            );

            let publicationDate = '';
            let thumbnail = '';
            if (link) {
                const response = await AxiosInstance.getUrlData(link);
                const html = response.data;

                const extractWeb = new Web(link, html);
                publicationDate = extractWeb.getPublicationDate();

                const pageThumbnail = extractWeb.getThumbnail();
                thumbnail = pageThumbnail ? pageThumbnail : '';
            }

            const article = {
                title,
                link,
                author: creatorName,
                readingTime,
                publicationDate: new Date(publicationDate),
                thumbnail: thumbnail ? thumbnail : '',
                source: 'DevTo',
            };

            if (title && link && creatorName && readingTime) {
                articles.push(article);
            }
        }

        await page.close();

        return articles;
    }
}

module.exports = DevTo;
