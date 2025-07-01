const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", userController.createUser);
router.post("/loginAsGuest", userController.loginAsGuest);
router.post("/update", authMiddleware, userController.updateUser);
router.post("/generate-token", userController.generateToken);
router.get("/verify", userController.verifyToken);
router.post("/login", userController.loginUser);
router.get("/user", authMiddleware, userController.getUser);
router.post("/otp-verify", userController.verifyUser);
router.get("/log-out", authMiddleware, userController.logOut);
router.post("/send-otp", userController.sendOtp);
router.post("/resend-otp", userController.resendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.get(
  "/restaurant-users/:restaurant_id",
  authMiddleware,
  userController.getRestaurantUser
);
router.post("/get-res-users/:restaurant_id", userController.getAllRestaurantUsers);

module.exports = router;
