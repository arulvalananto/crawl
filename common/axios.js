const axios = require('axios');
const { response } = require('express');

exports.getUrlData = async (url) => {
    return new Promise((resolve, reject) => {
        return axios
            .get(url, {
                headers: { 'Accept-Encoding': 'gzip' },
            })
            .then((response) => resolve(response))
            .catch((error) => {
                if (error instanceof axios.AxiosError) {
                    if (error.response.status === 403) {
                        reject({ message: 'Forbidden', statusCode: 403 });
                    }
                } else {
                    reject(error);
                }
            });
    });
};
