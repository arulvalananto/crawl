const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');
const { onRequest } = require('firebase-functions/v2/https');

const webRouter = require('./routes/web.route');
const globalErrorExceptionHandler = require('./common/globalErrorHandler');

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());
app.use(
    compression({
        // filter decides if the response should be compressed or not,
        // based on the `shouldCompress` function above
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                // don't compress responses if this request header is present
                return false;
            }

            // fallback to standard compression
            return compression.filter(req, res);
        },
        // threshold is the byte threshold for the response body size
        // before compression is considered, the default is 1kb
        threshold: 0,
    })
);

app.use('/api/web', webRouter);

app.use('*', (req, res) => {
    res.status(404).json({
        message: `Can't find ${req.originalUrl} this route`,
    });
});

app.use(globalErrorExceptionHandler);

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});

exports.api = onRequest(app);
