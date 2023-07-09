import * as cheerio from 'cheerio';

import constants from './constants';
import { estimateReadingTime, extractKeywords } from './helpers';

class ExtractWeb {
    private url: string;
    private $: cheerio.CheerioAPI;

    constructor(url: string, html: string) {
        this.url = url;
        this.$ = cheerio.load(html);
    }

    private getUrl() {
        return this.url;
    }

    private meta(
        value: string,
        name = constants.PROPERTY,
        attr = constants.CONTENT
    ) {
        return this.$(`meta[${name}="${value}"]`).attr(attr);
    }

    private getTitle() {
        return this.$(constants.TITLE).text() || constants.UNTITLED;
    }

    private getThumbnail() {
        return this.meta(constants.OG_IMAGE);
    }

    private getSiteName() {
        return (
            this.meta(constants.OG_SITE_NAME) ||
            this.meta(constants.NAME, constants.ITEM_PROP) ||
            this.meta(constants.TWITTER_SITE, constants.NAME)
        );
    }

    private getDescription() {
        return (
            this.$(constants.META_DESCRIPTION).text() ||
            this.meta(constants.OG_DESCRIPTION) ||
            this.meta(constants.TWITTER_DESCRIPTION) ||
            ''
        );
    }

    private getType() {
        return this.meta(constants.OG_TYPE) || '';
    }

    private getKeywords() {
        const keywords = this.meta(constants.KEYWORDS) || [];

        if (keywords.length) return keywords;
        else {
            const title = this.getTitle();
            const description = this.getDescription();

            const textContent = this.$(constants.HEADER_SELECTOR).text();
            const combineContent = `${title} ${description} ${textContent}`;
            return extractKeywords(combineContent);
        }
    }

    private getLogo() {
        return this.$(constants.IMAGE_WITH_LOGO).attr(constants.SOURCE);
    }

    private getAuthor() {
        return (
            this.meta(constants.OG_AUTHOR) ||
            this.meta(constants.AUTHOR, constants.NAME)
        );
    }

    private getIconExtractor(name: string, type: string) {
        const arr: any[] = [];

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

    private getIcons() {
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

    private getReadingTime() {
        const type = this.meta(constants.OG_TYPE);
        if (type === constants.ARTICLE) {
            const content = this.$(constants.HEADER_WITH_PARAGRAPH).text();

            const readingTime = estimateReadingTime(content);
            return readingTime;
        }
        return undefined;
    }

    getData() {
        return {
            url: this.getUrl(),
            type: this.getType(),
            logo: this.getLogo(),
            title: this.getTitle(),
            author: this.getAuthor(),
            iconSet: this.getIcons(),
            siteName: this.getSiteName(),
            thumbnail: this.getThumbnail(),
            description: this.getDescription(),
            keywords: this.getKeywords(),
            readingTime: this.getReadingTime(),
        };
    }
}

export default ExtractWeb;
