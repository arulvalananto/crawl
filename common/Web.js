const cheerio = require('cheerio');

const constants = require('./constants');
const { wordsToRemove } = require('./static');

/**
 * Extract webpage data
 */
class Web {
    /**
     * Constructor function for Web
     * @param {string} url
     * @param {string} html
     */
    constructor(url, html) {
        this.url = url;
        this.$ = cheerio.load(html);
    }

    /**
     * Extract keywords from content
     * @param {*} text
     * @param {*} limit
     * @returns
     */
    extractKeywords(text, limit = 25) {
        const words = text.split(/\s+/);

        const frequencyMap = {};
        for (const word of words) {
            const cleanedWord = word.toLowerCase().replace(/[^\w\s]/gi, '');
            if (cleanedWord) {
                frequencyMap[cleanedWord] =
                    (frequencyMap[cleanedWord] || 0) + 1;
            }
        }

        const sortedWords = Object.keys(frequencyMap).sort(
            (a, b) => frequencyMap[b] - frequencyMap[a]
        );

        const filteredWords = sortedWords.filter(
            (word) => !wordsToRemove.includes(word)
        );

        const numKeywords = limit;
        return filteredWords.slice(0, numKeywords);
    }

    /**
     * Estimate the reading time of the content if the website/webpage is article.
     * @param {*} content
     * @param {*} wordPerMinute
     * @returns
     */
    estimateReadingTime(content, wordPerMinute = 150) {
        const wordCount = content.trim().split(/\s+/).length;

        const readingTime = Math.ceil(wordCount / wordPerMinute);
        return readingTime;
    }

    /**
     * Get website url
     * @return {string} url
     */
    getUrl() {
        return this.url;
    }

    /**
     * Get information from Meta
     * @param {string} value
     * @param {string} name
     * @param {string} attr
     * @return {string} content
     */
    meta(value, name = constants.PROPERTY, attr = constants.CONTENT) {
        return this.$(`meta[${name}="${value}"]`).attr(attr);
    }

    /**
     * Get title information from webpage
     * @return {string} title
     */
    getTitle() {
        return (
            this.$(constants.TITLE).html() ||
            this.$(constants.TITLE).text() ||
            constants.UNTITLED
        );
    }

    /**
     * Get thumbnail information from webpage
     * @return {string} thumbnail
     */
    getThumbnail() {
        return this.meta(constants.OG_IMAGE);
    }

    /**
     * Extract site name form url
     * @return {string} site_name
     */
    getSiteName() {
        return (
            this.meta(constants.OG_SITE_NAME) ||
            this.meta(constants.NAME, constants.ITEM_PROP) ||
            this.meta(constants.TWITTER_SITE, constants.NAME)
        );
    }

    /**
     * Extract description from url
     * @return {string} description
     */
    getDescription() {
        return (
            this.$(constants.META_DESCRIPTION).text() ||
            this.meta(constants.OG_DESCRIPTION) ||
            this.meta(constants.TWITTER_DESCRIPTION) ||
            ''
        );
    }

    /**
     * Get type of website from url
     * @return {string} type
     */
    getType() {
        return this.meta(constants.OG_TYPE) || '';
    }

    /**
     * Get keywords from url content / meta tag
     * @return {string[]} keywords
     */
    getKeywords() {
        const keywords = this.meta(constants.KEYWORDS) || [];

        if (keywords.length) return keywords;
        else {
            const title = this.getTitle();
            const description = this.getDescription();

            const textContent = this.$(constants.HEADER_SELECTOR).text();
            const combineContent = `${title} ${description} ${textContent}`;
            return this.extractKeywords(combineContent);
        }
    }

    /**
     * Get website logo
     * @return {string} logo
     */
    getLogo() {
        return this.$(constants.IMAGE_WITH_LOGO).attr(constants.SOURCE);
    }

    /**
     * Extract author name
     * @return {string} author
     */
    getAuthor() {
        return (
            this.meta(constants.OG_AUTHOR) ||
            this.meta(constants.AUTHOR, constants.NAME)
        );
    }

    /**
     * Extractor for icons
     * @param {string} name
     * @param {string} type
     * @return {any[]} icons[]
     */
    getIconExtractor(name, type) {
        const arr = [];

        this.$(name).each((_, element) => {
            const href = this.$(element).attr(constants.HREF);
            const sizes = this.$(element).attr(constants.SIZES);

            arr.push({
                type,
                sizes: sizes ? sizes : constants.DEFAULT_ICON_SIZE,
                href,
            });
        });

        return arr;
    }

    /**
     * Extract icons from url
     * @return {any[]} icons
     */
    getIcons() {
        const icons = this.getIconExtractor(
            constants.ICON_SELECTOR,
            constants.ICON
        );
        const appleIcons = this.getIconExtractor(
            constants.APPLE_ICON_SELECTOR,
            constants.APPLE_TOUCH_ICON
        );
        const maskIcons = this.getIconExtractor(
            constants.MASK_ICON_SELECTOR,
            constants.MASK_ICON
        );

        return [...icons, ...appleIcons, ...maskIcons];
    }

    /**
     * Measure reading time for the website if it is an article.
     * @return {number} reading_time
     */
    getReadingTime(isArticle = false) {
        // hackernoon
        const scriptContent = this.$('script#__NEXT_DATA__').html();
        if (scriptContent) {
            const scriptData = JSON.parse(scriptContent);
            const estimatedTime = scriptData.props.pageProps.data.estimatedTime;
            return estimatedTime;
        }

        const type = this.meta(constants.OG_TYPE);
        if (type === constants.ARTICLE || isArticle) {
            const content = this.$(constants.HEADER_WITH_PARAGRAPH).text();

            const readingTime = this.estimateReadingTime(content);
            return readingTime;
        }
        return undefined;
    }

    getPublicationDate() {
        const scriptContent = this.$('script#__NEXT_DATA__').html();
        if (scriptContent) {
            const scriptData = JSON.parse(scriptContent);
            const publicationDate = scriptData.props.pageProps.data.publishedAt;
            return publicationDate * 1000;
        }

        const lastUpdatedDate = this.meta('last-updated');
        if (lastUpdatedDate) return lastUpdatedDate;

        return new Date();
    }

    /**
     * Gather website info
     * @return {any} data
     */
    getData() {
        return {
            title: this.getTitle(),
            description: this.getDescription(),
            siteName: this.getSiteName(),
            url: this.getUrl(),
            keywords: this.getKeywords(),
            type: this.getType(),
            author: this.getAuthor(),
            thumbnail: this.getThumbnail(),
            logo: this.getLogo(),
            readingTime: this.getReadingTime(),
            iconSet: this.getIcons(),
        };
    }
}

module.exports = Web;
