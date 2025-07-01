const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateSuperAdmin } = require("../middleware/authMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
// const { verifyToken } = require("../middleware/auth");

// Restaurant owner signup and verification routes
router.post("/restaurant-signup", adminController.restaurantOwnerSignup);
router.post("/verify-restaurant-otp", adminController.verifyRestaurantRegistrationOTP);

// Super admin routes for restaurant approval
router.get("/pending-approvals", authenticateSuperAdmin, adminController.getPendingApprovals);
router.post("/approve-reject-restaurant", authenticateSuperAdmin, adminController.approveRejectRestaurant);

// Existing routes
router.post("/signup", adminController.addAdminUser);
router.post("/login", adminController.loginAdminUser);
router.post("/validate", adminController.verifyPassword);
router.post("/change-password", adminController.changePassword);
router.post("/forgot-password", adminController.forgotPassword);
router.post("/reset-password/:adminTokenReset", adminController.resetPassword);
router.get("/verify", authMiddleware, adminController.verifyUser);
router.get("/logout", adminController.logOut);

//Staff Management Routes
router.post("/add-staff", adminController.addRestaurantMember);
router.post("/get-staff", adminController.getRestaurantMembers);
router.delete("/delete-staff/:id", adminController.deleteRestaurantMember);
router.put("/update-staff/:id", adminController.updateRestaurantMember);
router.post("/request-tracevenue-approval", authMiddleware, adminController.requestTraceVenueApproval);

// TraceVenue routes
router.get("/tracevenue-status/:restaurantId", authMiddleware, adminController.getTraceVenueStatus);

// Venue approval routes
router.get("/pending-venues", adminController.getPendingVenues);
router.put("/venue-status", adminController.updateVenueStatus);

module.exports = router;
