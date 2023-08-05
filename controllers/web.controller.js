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

            const response = await getUrlData(url);
            const html = response.data;

            const link = new Links(url, html);
            const links = link.getAllLinks();

            res.status(200).json({ links });
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

            const response = await getUrlData(url);
            const html = response.data;

            const image = new Images(url, html);
            const images = await image.getAllImages();

            res.status(200).json({ images });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }
}

module.exports = WebContoller;
