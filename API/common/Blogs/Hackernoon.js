const Web = require('../Web');
const AxiosInstance = require('../axios');
const constants = require('../constants');
const { initializeBrowser } = require('../browserInstance');

/**
 * The `Hackernoon` class is used to scrape trending articles from the Hackernoon website.
 */
class Hackernoon {
    /**
     * Creates an instance of Hackernoon.
     * @param {string} url - The URL of the Hackernoon website.
     */
    constructor(url) {
        this.url = url;
    }

    /**
     * Retrieves the data of the specified XPath element on the page.
     * @param {Page} page - The page object.
     * @param {string} xPath - The XPath expression to locate the element.
     * @param {string} [attribute='innerText'] - The attribute to extract from the element.
     * @returns {Promise<string|null>} The extracted data or null if the element is not found.
     */
    async getXPathElement(page, xPath, attribute = 'innerText') {
        const elementArray = await page.$x(xPath);

        if (elementArray.length > 0) {
            const element = elementArray[0];
            const data = await page.evaluate(
                (el, attribute) => {
                    if (attribute === 'backgroundImage') {
                        return getComputedStyle(el).backgroundImage.match(
                            /url\("([^"]+)"/
                        )[1];
                    } else {
                        return el[attribute];
                    }
                },
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
            return { readingTime: '', publicationDate: '' };
        }

        const response = await AxiosInstance.getUrlData(link);
        const html = response.data;
        const extractWeb = new Web(link, html);

        const [publicationDate, readingTime] = await Promise.all([
            extractWeb.getPublicationDate(),
            extractWeb.getReadingTime(true),
        ]);

        return {
            readingTime: readingTime ? `${readingTime} min Read` : '1 min Read',
            publicationDate,
        };
    }

    /**
     * Retrieves the trending articles from the Hackernoon website.
     * @param {number} [count=10] - The number of articles to retrieve.
     * @param {Object} [options={ headless: 'new', devtools: false, url: '', additional: 14 }] - The options for retrieving articles.
     * @returns {Promise<Array<Object>>} The array of trending articles.
     */
    async getTrendingArticles(
        count = constants.DEFAULT_ARTICLE_COUNT,
        options = { headless: 'new', devtools: false, url: '', additional: 14 }
    ) {
        console.time('hackernoon');
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

        for (let i = 1; i <= count + options.additional; i++) {
            const path = `/html/body/div[1]/div/main/section/div/div[2]/div[${i}]/div`;

            const titleXPath = `${path}/div[2]/h3/a`;
            const linkXPath = `${path}/div[2]/h3/a`;
            const authorXPath = `${path}/div[2]/div/a/span`;
            const thumbnailXPath = `${path}/div[3]`;

            await page.waitForXPath(titleXPath, { timeout: 5000 });
            await page.waitForXPath(authorXPath, { timeout: 5000 });

            const [title, link, author, thumbnail] = await Promise.all([
                this.getXPathElement(page, titleXPath),
                this.getXPathElement(page, linkXPath, 'href'),
                this.getXPathElement(page, authorXPath),
                this.getXPathElement(page, thumbnailXPath, 'backgroundImage'),
            ]);

            const { publicationDate, readingTime } = await this.fetchLinkData(
                link
            );

            const article = {
                title,
                link,
                author,
                readingTime,
                publicationDate: new Date(publicationDate),
                thumbnail: thumbnail ? thumbnail : '',
                source: 'Hackernoon',
            };

            if (title && link && author && readingTime) {
                articles.push(article);
            }
        }

        await page.close();
        console.timeEnd('hackernoon');

        return articles;
    }
}

module.exports = Hackernoon;
