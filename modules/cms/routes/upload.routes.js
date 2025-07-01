const express = require('express');
const router = express.Router();
const { getSignedUrl } = require('../controllers/s3-media.controller');

router.get('/s3-url', getSignedUrl);

module.exports = router;
