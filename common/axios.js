const axios = require('axios');

exports.getUrlData = async (url) =>
    await axios.get(url, {
        headers: { 'Accept-Encoding': 'gzip' },
    });
