const axios = require('axios');
const imageSize = require('image-size');

const { wordsToRemove } = require('./static');

exports.extractKeywords = (text, limit = 25) => {
    const words = text.split(/\s+/);

    const frequencyMap = {};
    for (const word of words) {
        const cleanedWord = word.toLowerCase().replace(/[^\w\s]/gi, '');
        if (cleanedWord) {
            frequencyMap[cleanedWord] = (frequencyMap[cleanedWord] || 0) + 1;
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
};

exports.estimateReadingTime = (content, wordPerMinute = 150) => {
    const wordCount = content.trim().split(/\s+/).length;

    const readingTime = Math.ceil(wordCount / wordPerMinute);
    return readingTime;
};

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
