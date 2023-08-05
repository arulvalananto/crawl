const axios = require('axios');

const APIRequest = (callback) => {
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

exports.getUrlData = (url) => {
    return new Promise((resolve, reject) => {
        return axios
            .get(url, {
                headers: { 'Accept-Encoding': 'gzip' },
            })
            .then((response) => resolve(response))
            .catch((error) => {
                if (
                    error instanceof axios.AxiosError &&
                    error.response &&
                    error.response.status === 403
                ) {
                    reject({ message: 'Forbidden', statusCode: 403 });
                } else reject(error);
            });
    });
};

exports.getUrlData = async (url) =>
    await APIRequest(
        axios.get(url, {
            headers: { 'Accept-Encoding': 'gzip' },
        })
    );
