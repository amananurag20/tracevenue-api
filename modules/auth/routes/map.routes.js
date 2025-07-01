const express = require('express');
const {getGoogleLocation} = require('../controllers/map.controller');
const router = express.Router();

router.get('/geo-location', getGoogleLocation);

module.exports = router;