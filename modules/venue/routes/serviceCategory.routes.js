const express = require('express');
const {
  createServiceCategoryController,
  getServiceCategoryController,
} = require('../controllers/serviceCategory.controller');
const router = express();

router.post('/', createServiceCategoryController);
router.get('/', getServiceCategoryController);


module.exports = router;