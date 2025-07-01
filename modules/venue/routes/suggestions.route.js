// routes/suggestion.routes.js
const express = require('express');
const router = express.Router();
const {createSuggestion, getSuggestions, getSuggestionsAll} = require('../controllers/suggestions.controller');

router.post('/createSuggestion', createSuggestion);
// Express.js example
router.get('/getSuggestions', getSuggestions)

router.get('/', getSuggestionsAll)

module.exports = router;