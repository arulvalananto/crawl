const puppeteer = require('puppeteer');

const ExtractWeb = require('../common/Web');
const helpers = require('../common/helpers');
const AxiosInstance = require('../common/axios');
const Medium = require('../common/Blogs/Medium');
const constants = require('../common/constants');

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

            const browser = await puppeteer.launch({ headless: 'new' });
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
            await browser.close();

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

            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            await page.goto(url);
            new Promise((r) => setTimeout(r, 2000));
            const imageUrls = await page.$$eval('img', (images) =>
                images.map((img) => ({ src: img.src, alt: img.alt }))
            );
            await browser.close();

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

    static async gatherTrendingArticles(req, res) {
        try {
            const { articleCount } = req.params;

            const medium = new Medium(constants.MEDIUM_BASE_URL);

            const articles = await medium.getTrendingArticles(articleCount);

            res.status(200).json({ total: articles.length, articles });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }
}

module.exports = WebContoller;
