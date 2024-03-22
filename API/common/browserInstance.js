const puppeteer = require('puppeteer');

let browserInstance;

async function initializeBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new',
        });
    }
    return browserInstance;
}

module.exports = { initializeBrowser };
