const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const Web = require('../Web');
const AxiosInstance = require('../axios');

class Hackernoon {
    constructor(url) {
        this.url = url;
    }

    async getTrendingArticles(
        count,
        options = { headless: 'new', devtools: false, url: '', additional: 14 }
    ) {
        const browser = await puppeteer.launch({
            headless: options.headless,
            devtools: options.devtools,
        });

        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });

        const baseUrl = options.url ? options.url : this.url;
        await page.goto(baseUrl);

        const articleCount = count ? count : 6;
        const articles = [];

        for (let i = 1; i <= articleCount + options.additional; i++) {
            const path = `/html/body/div[1]/div/main/section/div/div[2]/div[${i}]/div`;

            const titleElementXPath = `${path}/div[2]/h3/a`;
            const linkElementXPath = `${path}/div[2]/h3/a`;
            const creatorNameElementXPath = `${path}/div[2]/div/a/span`;
            const thumbnailElementXPath = `${path}/div[3]`;

            await page.waitForXPath(titleElementXPath, { timeout: 5000 });
            await page.waitForXPath(creatorNameElementXPath, { timeout: 5000 });

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

            const thumbnailElement = await page.$x(thumbnailElementXPath);
            const thumbnail = await page.evaluate(
                (el) => {
                    const backgroundImageStyle =
                        getComputedStyle(el).backgroundImage;
                    return backgroundImageStyle.match(/url\("([^"]+)"/)[1];
                },
                thumbnailElement ? thumbnailElement[0] : null
            );

            let readingTime = '';
            let publicationDate = '';
            if (link) {
                const response = await AxiosInstance.getUrlData(link);
                const html = response.data;

                const extractWeb = new Web(link, html);
                publicationDate = extractWeb.getPublicationDate();

                const time = extractWeb.getReadingTime(true);
                readingTime = time ? `${time} min Read` : '1 min Read';
            }

            if (title && link && creatorName && readingTime) {
                articles.push({
                    title,
                    link,
                    author: creatorName,
                    readingTime,
                    publicationDate: new Date(publicationDate),
                    thumbnail: thumbnail ? thumbnail : '',
                    source: 'Hackernoon',
                });
            }
        }

        await browser.close();

        return articles;
    }
}

module.exports = Hackernoon;
