const express = require('express');
const { signup, login, getUserDetails, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user-details', protect, getUserDetails);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Test routes for role-based auth
router.get('/vendor-only', protect, authorize('vendor'), (req, res) => {
    res.json({ message: 'Vendor access granted', user: req.user });
});

router.get('/customer-only', protect, authorize('customer'), (req, res) => {
    res.json({ message: 'Customer access granted', user: req.user });
});

module.exports = router;
