const express = require('express');
const {
  createIconsController,
  getIconsController,
} = require('../controllers/icons.controller');
const router = express();

router.post('/', createIconsController);
router.get('/', getIconsController);


module.exports = router;
