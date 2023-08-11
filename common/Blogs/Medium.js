const Web = require('../Web');
const AxiosInstance = require('../axios');
const constants = require('../constants');
const { initializeBrowser } = require('../browserInstance');

class Medium {
    constructor(url) {
        this.url = url;
    }

    async getXPathElement(page, xPath, attribute = 'innerText') {
        const elementArray = await page.$x(xPath);

        if (elementArray.length > 0) {
            const element = elementArray[0];
            const data = await page.evaluate(
                (el, attribute) => el[attribute],
                element,
                attribute
            );
            return data;
        } else {
            return null;
        }
    }

    /**
     * Fetches additional data for the specified link.
     * @param {string} link - The link to fetch data for.
     * @returns {Promise<Object>} The fetched data including reading time and publication date.
     */
    async fetchLinkData(link) {
        if (!link) {
            return { thumbnail: '' };
        }

        const response = await AxiosInstance.getUrlData(link);
        const html = response.data;
        const extractWeb = new Web(link, html);

        const [thumbnail] = await Promise.all([extractWeb.getThumbnail()]);

        return { thumbnail };
    }

    async gatherFirstSixArticles(page, count) {
        const articles = [];
        for (let i = 1; i <= count; i++) {
            const path = `/html/body/div/div/div[4]/div[1]/div/div/div/div[2]/div/div[${i}]/div/div/div[2]`;

            const titleXPath = `${path}/div[2]/a/div/h2`;
            const linkXPath = `${path}/div[2]/a`;
            const authorXPath = `${path}/div[1]/div/div/div/div/div/div/a/h4`;
            const readingTimeXPath = `${path}/span/div/span[2]`;
            const dateXPath = `${path}/span/div/span[1]`;

            await page.waitForXPath(titleXPath, { timeout: 5000 });
            await page.waitForXPath(linkXPath, { timeout: 5000 });
            await page.waitForXPath(authorXPath, { timeout: 5000 });
            await page.waitForXPath(readingTimeXPath, { timeout: 5000 });
            await page.waitForXPath(dateXPath, { timeout: 5000 });

            const [title, link, author, readingTime, date] = await Promise.all([
                this.getXPathElement(page, titleXPath),
                this.getXPathElement(page, linkXPath, 'href'),
                this.getXPathElement(page, authorXPath),
                this.getXPathElement(page, readingTimeXPath),
                this.getXPathElement(page, dateXPath),
            ]);

            const { thumbnail } = await this.fetchLinkData(link);

            const article = {
                title,
                link,
                author,
                readingTime,
                publicationDate: new Date(
                    `${date}, ${new Date().getFullYear()}`
                ),
                thumbnail: thumbnail || '',
                source: 'Medium',
            };

            if (title && link && author && readingTime && date) {
                articles.push(article);
            }
        }

        return articles;
    }

    async gatherRemainingArticles(page, count) {
        const articles = [];

        for (let i = 1; i <= count; i++) {
            const path = `/html/body/div/div/div[4]/div[3]/div[1]/div/div/section/div/div/div[1]/div[${i}]/div/div`;

            const titleXPath = `${path}/div/a/h2`;
            const linkXPath = `${path}/div/a`;
            const authorXPath = `${path}/div/div[1]/div/div/div[1]/div/div/div/a/h4`;
            const readingTimeXPath = `${path}/div/div[2]/div[1]/span[2]/span`;
            const dateXPath = `${path}/div/div[2]/div[1]/span[1]/span/span`;
            const thumbnailXPath = `${path}/a/img`;

            await page.waitForXPath(titleXPath, { timeout: 5000 });
            await page.waitForXPath(linkXPath, { timeout: 5000 });
            await page.waitForXPath(authorXPath, { timeout: 5000 });
            await page.waitForXPath(readingTimeXPath, { timeout: 5000 });
            await page.waitForXPath(dateXPath, { timeout: 5000 });

            const [title, link, author, readingTime, date, thumbnail] =
                await Promise.all([
                    this.getXPathElement(page, titleXPath),
                    this.getXPathElement(page, linkXPath, 'href'),
                    this.getXPathElement(page, authorXPath),
                    this.getXPathElement(page, readingTimeXPath),
                    this.getXPathElement(page, dateXPath),
                    this.getXPathElement(page, thumbnailXPath, 'src'),
                ]);

            const article = {
                title,
                link,
                author,
                readingTime,
                publicationDate: new Date(
                    `${date}, ${new Date().getFullYear()}`
                ),
                thumbnail: thumbnail || '',
                source: 'Medium',
            };

            if (title && link && author && readingTime && date) {
                articles.push(article);
            }
        }

        return articles;
    }

    async getTrendingArticles(
        count = constants.DEFAULT_ARTICLE_COUNT,
        options = { headless: 'new', devtools: false, url: '', additional: 4 }
    ) {
        console.time('medium');
        const { additional, url } = options;
        const browser = await initializeBrowser();

        const page = await browser.newPage();

        const baseUrl = url || this.url;
        await page.goto(baseUrl);

        const articles = [];

        const [firstSixArticles, remainingArticles] = await Promise.all([
            this.gatherFirstSixArticles(page, count),
            this.gatherRemainingArticles(page, count + additional),
        ]);

        articles.push(...firstSixArticles, ...remainingArticles);

        await page.close();
        console.timeEnd('medium');

        return articles;
    }
}

module.exports = Medium;
