const cheerio = require('cheerio');

class Links {
    /**
     * Constructor function for Web
     * @param {string} url
     * @param {string} html
     */
    constructor(url, html) {
        this.url = url;
        this.$ = cheerio.load(html);
    }

    getAllLinks() {
        const links = [];
        this.$('a').each((index, element) => {
            const href = this.$(element).attr('href');

            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                const parsedURL = new URL(this.url);
                const baseURL = `${parsedURL.protocol}//${parsedURL.host}`;
                const absoluteLink = new URL(href, baseURL);
                links.push(absoluteLink.href);
            } else {
                links.push(href);
            }
        });

        return [...new Set(links)];
    }

    getAllExternalLinks() {
        const links = [];
        this.$('a').each((index, element) => {
            const href = this.$(element).attr('href');

            if (href && href.startsWith('http')) {
                links.push(href);
            }
        });

        return [...new Set(links)];
    }

    getAllInternalLinks() {
        const links = [];

        this.$('a').each((index, element) => {
            const href = this.$(element).attr('href');

            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                const parsedURL = new URL(this.url);
                const baseURL = `${parsedURL.protocol}//${parsedURL.host}`;
                const absoluteLink = new URL(href, baseURL);
                links.push(absoluteLink.href);
            }
        });

        return [...new Set(links)];
    }
}

module.exports = Links;
