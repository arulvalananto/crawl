const axios = require('axios');

const ExtractWeb = require('../common/extract/Web');
const { getUrlData } = require('../common/axios');
const Links = require('../common/extract/Links');
const Images = require('../common/extract/Images');

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

            const response = await getUrlData(url);
            const html = response.data;

            const extractWeb = new ExtractWeb(url, html);

            res.status(200).json(extractWeb.getData());
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async extractWebTools(req, res) {}

    static async gatherAllLinks(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ message: 'Invalid URL' });
            }

            const response = await getUrlData(url);
            const html = response.data;

            const link = new Links(url, html);
            const links = link.getAllLinks();

            res.status(200).json({ links });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async gatherAllImages(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ message: 'Invalid URL' });
            }

            const response = await getUrlData(url);
            const html = response.data;

            const image = new Images(url, html);
            const images = image.getAllImages();

            res.status(200).json({ images });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                stack: error.stack,
            });
        }
    }
}

module.exports = WebContoller;
