const Web = require('../Web');
const AxiosInstance = require('../axios');
const constants = require('../constants');
const { initializeBrowser } = require('../browserInstance');

class Hashnode {
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
            return { thumbnail: '', publicationDate: '' };
        }

        const response = await AxiosInstance.getUrlData(link);
        const html = response.data;
        const extractWeb = new Web(link, html);

        const [publicationDate, thumbnail] = await Promise.all([
            extractWeb.getPublicationDate(),
            extractWeb.getThumbnail(),
        ]);

        return {
            thumbnail,
            publicationDate,
        };
    }

    async getTrendingArticles(
        count = constants.DEFAULT_ARTICLE_COUNT,
        options = { headless: 'new', devtools: false, url: '', additional: 14 }
    ) {
        console.time('hashnode');
        const { additional, url } = options;
        const browser = await initializeBrowser();

        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });

        const baseUrl = url || this.url;
        await page.goto(baseUrl);

        const articles = [];

        for (let i = 2; i <= count + additional; i++) {
            const path = `/html/body/div[7]/div/div[2]/main/div[3]/div[${i}]`;

            const titleXPath = `${path}/a`;
            const linkXPath = `${path}/a`;
            const authorXPath = `${path}/div/div[1]/div/div[2]/div/div/button`;
            const readingTimeXPath = `${path}/div/div[2]/div[2]/div[2]/small`;

            const [title, link, author, readingTime] = await Promise.all([
                this.getXPathElement(page, titleXPath),
                this.getXPathElement(page, linkXPath, 'href'),
                this.getXPathElement(page, authorXPath),
                this.getXPathElement(page, readingTimeXPath),
            ]);

            const { thumbnail, publicationDate } = await this.fetchLinkData(
                link
            );

            const article = {
                title,
                link,
                author,
                readingTime,
                publicationDate: new Date(publicationDate),
                thumbnail: thumbnail || '',
                source: 'Hashnode',
            };

            if (title && link && author && readingTime) {
                articles.push(article);
            }
        }

        await page.close();
        console.timeEnd('hashnode');

        return articles;
    }
}

module.exports = Hashnode;
