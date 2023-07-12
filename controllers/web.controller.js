const axios = require('axios');

const ExtractWeb = require('../common/ExtractWeb');

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

            const response = await axios.get(url);
            const html = response.data;

            const extractWeb = new ExtractWeb(url, html);

            res.status(200).json(extractWeb.getData());
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = WebContoller;
