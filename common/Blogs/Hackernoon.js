const Web = require('../Web');
const AxiosInstance = require('../axios');
const constants = require('../constants');
const { initializeBrowser } = require('../browserInstance');

class Hackernoon {
    constructor(url) {
        this.url = url;
    }

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
