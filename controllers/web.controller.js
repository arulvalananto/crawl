const ExtractWeb = require('../common/Web');
const helpers = require('../common/helpers');
const DevTo = require('../common/Blogs/DevTo');
const AxiosInstance = require('../common/axios');
const Medium = require('../common/Blogs/Medium');
const constants = require('../common/constants');
const Hackernoon = require('../common/Blogs/Hackernoon');
const { initializeBrowser } = require('../common/browserInstance');

/**
 * controller function for website/webpage extraction
 */
class WebContoller {
    /**
     * Extract website/webpage based on given url
     * @param {Request} req
     * @param {Response} res
     */
    static async extractWeb(req, res) {
        try {
            const { url } = req.body;

            const response = await AxiosInstance.getUrlData(url);
            const html = response.data;

            const extractWeb = new ExtractWeb(url, html);

            res.status(200).json(extractWeb.getData());
        } catch (error) {
            const status = error.statusCode ?? 400;
            res.status(status).json({ message: error.message });
        }
    }

    /**
     * Extract the tools that are used in the given website/webpage/webapp
     * @param {Request} req
     * @param {Response} res
     */
    static async extractWebTools(req, res) {}

    /**
     * Gather all links in the given website/webpage/webapp
     * @param {Request} req
     * @param {Response} res
     */
    static async gatherAllLinks(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ message: 'Invalid URL' });
            }

            const browser = initializeBrowser();
            const page = await browser.newPage();

            // Disable image loading
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'image') request.abort();
                else request.continue();
            });

            await page.goto(url);
            new Promise((r) => setTimeout(r, 2000));
            const allLinks = await page.$$eval('a', (links) =>
                links.map((link) => {
                    return { href: link.href, title: link.innerText };
                })
            );
            await page.close();

            const links = helpers.categorizeLinks(
                helpers.removeDuplicateLinks(allLinks),
                url
            );
            res.status(200).json({ total: links.length, links });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Gather all the images in the specified website/webpage/webapp
     * @param {Request} req
     * @param {Response} res
     */
    static async gatherAllImages(req, res) {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ message: 'Invalid URL' });
            }

            const browser = initializeBrowser();
            const page = await browser.newPage();

            await page.goto(url);
            new Promise((r) => setTimeout(r, 2000));
            const imageUrls = await page.$$eval('img', (images) =>
                images.map((img) => ({ src: img.src, alt: img.alt }))
            );
            await page.close();

            const images = [];
            for (let image of imageUrls) {
                if (image.src && image.src.startsWith('https')) {
                    const dimensions = await helpers.getImageDimensions(
                        image.src
                    );
                    images.push({
                        ...image,
                        ...dimensions,
                    });
                }
            }

            res.status(200).json({ total: images.length, images });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }

    /**
     * Gather trending articles from top tech blog sites like medium, dev.to, hackernoon
     * @param {*} req
     * @param {*} res
     */
    static async gatherTrendingArticles(req, res) {
        try {
            const { articleCount } = req.params;
            const articles = [];

            const hackernoon = new Hackernoon(constants.HACKERNOON_BASE_URL);
            const medium = new Medium(constants.MEDIUM_BASE_URL);
            const dev = new DevTo(constants.DEVTO_BASE_URL);

            const [hackernoonArticles, mediumArticles, devToArticles] =
                await Promise.all([
                    hackernoon.getTrendingArticles(articleCount),
                    medium.getTrendingArticles(articleCount),
                    dev.getTrendingArticles(articleCount),
                ]);

            console.log('hackenoon', hackernoonArticles.length);
            console.log('medium', mediumArticles.length);
            console.log('dev', devToArticles.length);

            articles.push(
                ...hackernoonArticles,
                ...mediumArticles,
                ...devToArticles
            );

            res.status(200).json({ total: articles.length, articles });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                stack: error.stack,
            });
        }
    }
}

module.exports = WebContoller;
