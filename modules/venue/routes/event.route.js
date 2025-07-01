const express = require('express');
const { sanitizeData } = require('../middleware/sanitize.middleware');
const {
  createEventController,
  getEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  getEventSuggestionController,
  getCuisinesByEventNameController,
} = require('../controllers/event.controller');
const router = express();


router.get("/event-cuisines", getCuisinesByEventNameController)
router.get('/cuisines', getCuisinesByEventNameController);
router.get('/suggestion', getEventSuggestionController);

router.post('/', sanitizeData, createEventController);
router.get('/', getEventsController);
router.get('/:id', getEventByIdController);
router.put('/:id', sanitizeData, updateEventController);
router.delete('/:id', deleteEventController);

module.exports = router;
