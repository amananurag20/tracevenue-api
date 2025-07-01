const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/login", authController.loginUser);
router.post("/sign-up", authController.createUser);
router.get("/log-out", authMiddleware, authController.logOut);

module.exports = router;
