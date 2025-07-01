const express = require('express');
const {
  createVenueController,
  getVenuesController,
  getVenueByIdController,
  updateVenueController,
  getVenuesByLocation,
  deleteVenueController,
} = require('../controllers/venue.controller');
const { sanitizeData } = require('../middleware/sanitize.middleware');


const router = express.Router();

router.post('/', sanitizeData, createVenueController);
router.get('/', getVenuesController);
router.post('/by-location', getVenuesByLocation);
router.get('/:id', getVenueByIdController);
router.put('/:id', sanitizeData, updateVenueController);
router.delete('/:id', deleteVenueController);

module.exports = router;
