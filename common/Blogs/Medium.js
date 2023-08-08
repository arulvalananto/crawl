const puppeteer = require('puppeteer');
const Web = require('../Web');
const AxiosInstance = require('../axios');

class Medium {
    constructor(url) {
        this.url = url;
    }

    async getTrendingArticles(
        count,
        options = { headless: 'new', devtools: false, url: '', additional: 4 }
    ) {
        const browser = await puppeteer.launch({
            headless: options.headless,
            devtools: options.devtools,
        });

        const page = await browser.newPage();

        const baseUrl = options.url ? options.url : this.url;
        await page.goto(baseUrl);

        await page.waitForSelector('.pw-trending-post', { timeout: 5000 });

        const articleCount = count ? count : 6;
        const articles = [];

        for (let i = 1; i <= articleCount; i++) {
            const path = `/html/body/div/div/div[4]/div[1]/div/div/div/div[2]/div/div[${i}]/div/div/div[2]`;

            const titleElementXPath = `${path}/div[2]/a/div/h2`;
            const linkElementXPath = `${path}/div[2]/a`;
            const creatorNameElementXPath = `${path}/div[1]/div/div/div/div/div/div/a/h4`;
            const readingTimeElementXPath = `${path}/span/div/span[2]`;
            const dateElementXPath = `${path}/span/div/span[1]`;

            await page.waitForXPath(titleElementXPath, { timeout: 5000 });
            await page.waitForXPath(linkElementXPath, { timeout: 5000 });
            await page.waitForXPath(creatorNameElementXPath, { timeout: 5000 });
            await page.waitForXPath(readingTimeElementXPath, { timeout: 5000 });
            await page.waitForXPath(dateElementXPath, { timeout: 5000 });

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

            const dateElement = await page.$x(dateElementXPath);
            const date = await page.evaluate(
                (el) => el?.innerText,
                dateElement ? dateElement[0] : null
            );

            let thumbnail = '';

            if (link) {
                const response = await AxiosInstance.getUrlData(link);
                const html = response.data;

                const extractWeb = new Web(link, html);
                const pageThumbnail = extractWeb.getThumbnail();
                thumbnail = pageThumbnail ? pageThumbnail : '';
            }

            articles.push({
                title,
                link,
                creatorName,
                readingTime,
                date,
                thumbnail,
            });
        }

        for (let i = 1; i <= articleCount + options.additional; i++) {
            const path = `/html/body/div/div/div[4]/div[3]/div[1]/div/div/section/div/div/div[1]/div[${i}]/div/div`;

            const titleElementXPath = `${path}/div/a/h2`;
            const linkElementXPath = `${path}/div/a`;
            const creatorNameElementXPath = `${path}/div/div[1]/div/div/div[1]/div/div/div/a/h4`;
            const readingTimeElementXPath = `${path}/div/div[2]/div[1]/span[2]/span`;
            const dateElementXPath = `${path}/div/div[2]/div[1]/span[1]/span/span`;
            const thumbnailElementXPath = `${path}/a/img`;

            await page.waitForXPath(titleElementXPath, { timeout: 5000 });
            await page.waitForXPath(linkElementXPath, { timeout: 5000 });
            await page.waitForXPath(creatorNameElementXPath, { timeout: 5000 });
            await page.waitForXPath(readingTimeElementXPath, { timeout: 5000 });
            await page.waitForXPath(dateElementXPath, { timeout: 5000 });

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

            const dateElement = await page.$x(dateElementXPath);
            const date = await page.evaluate(
                (el) => el?.innerText,
                dateElement ? dateElement[0] : null
            );

            const thumbnailElement = await page.$x(thumbnailElementXPath);
            const thumbnail = await page.evaluate(
                (el) => el?.src,
                thumbnailElement ? thumbnailElement[0] : null
            );

            if (title && link && creatorName && readingTime && date) {
                articles.push({
                    title,
                    link,
                    author: creatorName,
                    readingTime,
                    publicationDate: date,
                    thumbnail: thumbnail ? thumbnail : '',
                    source: 'Medium',
                });
            }
        }

        await browser.close();

        return articles;
    }
}

module.exports = Medium;
