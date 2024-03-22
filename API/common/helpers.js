const axios = require('axios');
const imageSize = require('image-size');

exports.getImageDimensions = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data);
        const dimensions = imageSize(imageBuffer);

        return {
            width: dimensions.width,
            height: dimensions.height,
        };
    } catch (error) {
        console.error(`Error loading image ${imageUrl}: ${error.message}`);
        return null;
    }
};

exports.removeDuplicateLinks = (links) => {
    const uniqueLinks = new Set();
    const linksDictionary = {};

    for (let i = 0; i < links.length; i++) {
        const { href } = links[i];
        if (!linksDictionary.hasOwnProperty(href)) {
            linksDictionary[href] = href;
            uniqueLinks.add(links[i]);
        }
    }

    return [...uniqueLinks];
};

exports.categorizeLinks = (links, baseUrl) => {
    return links.map((link) => {
        const url = new URL(link.href);
        const isExternal =
            url.hostname === new URL(baseUrl).hostname ? false : true;

        return { ...link, isExternal };
    });
};

exports.APIRequest = (callback) => {
    return new Promise((resolve, reject) => {
        return callback
            .then((response) => resolve(response))
            .catch((error) => {
                if (error instanceof axios.AxiosError) {
                    if (error.response && error.response.status === 403) {
                        reject({ message: 'Forbidden', statusCode: 403 });
                    }
                } else {
                    reject(error);
                }
            });
    });
};
