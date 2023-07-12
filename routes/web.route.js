const express = require('express');

const WebContoller = require('../controllers/web.controller');

const router = express.Router();

router.post('/', WebContoller.extractWeb);

module.exports = router;
