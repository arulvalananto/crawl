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
app.use(compression());
app.use(cors());

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
