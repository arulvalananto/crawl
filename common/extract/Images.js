const cheerio = require('cheerio');

const { getImageDimensions } = require('../helpers');

class Images {
    /**
     * Constructor function for Web
     * @param {string} url
     * @param {string} html
     */
    constructor(url, html) {
        this.url = url;
        this.$ = cheerio.load(html);
    }

    async getAllImages() {
        const images = [];
        const imageElements = this.$('img');

        for (const element of imageElements) {
            const src = this.$(element).attr('src');
            const alt = this.$(element).attr('alt');

            if (src && src.startsWith('https')) {
                const dimensions = await getImageDimensions(src);
                images.push({ src, alt, ...dimensions });
            }
        }

        return images;
    }
}

module.exports = Images;
