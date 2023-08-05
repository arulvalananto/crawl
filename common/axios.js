const axios = require('axios');

const { APIRequest } = require('./helpers');

exports.getUrlData = async (url) =>
    await APIRequest(
        axios.get(url, {
            headers: { 'Accept-Encoding': 'gzip' },
        })
    );
