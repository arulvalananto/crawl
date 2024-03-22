const transformMessage = (message) => {
    if (message.startsWith('E11000')) {
        return 'Already Exist';
    }
    return message;
};

module.exports = (err, _, res) => {
    err.status = err.status || 'fail';
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        status: err.status,
        message: transformMessage(err.message),
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};
