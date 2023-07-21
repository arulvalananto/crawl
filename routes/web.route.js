const express = require('express');

const WebController = require('../controllers/web.controller');

const router = express.Router();

router.post('/', WebController.extractWeb);

router.post('/links', WebController.gatherAllLinks);

router.post('/images', WebController.gatherAllImages);

module.exports = router;
