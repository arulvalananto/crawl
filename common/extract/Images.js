const cheerio = require('cheerio');

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

    getAllImages() {
        const images = [];
        this.$('img').each((index, element) => {
            const src = this.$(element).attr('src');
            const alt = this.$(element).attr('alt');

            if (src && src.startsWith('https')) {
                console.log('inside');
                images.push({ src, alt });
            }
            // console.log(src.startsWith('http'));
            console.log(src);
        });

        return images;
    }
}

module.exports = Images;
