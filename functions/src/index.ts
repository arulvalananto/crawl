import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';

export const helloWorld = onRequest((request, response) => {
    logger.info('Hello logs!', { structuredData: true });
    response.json({
        helo: 'hello',
    });
});

import cors from 'cors';
import express from 'express';
import axios, { AxiosResponse } from 'axios';
import ExtractWeb from './common/ExtractWeb';

const app = express();

app.use(cors({ origin: true }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'works' });
});

app.post('/web', async (req, res) => {
    try {
        const { url } = req.body;

        const response: AxiosResponse<string> = await axios.get(url);
        const html = response.data;

        const extractWeb = new ExtractWeb(url, html);

        res.status(200).json(extractWeb.getData());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Something went wrong!' });
        }
    }
});

exports.api = onRequest(app);
