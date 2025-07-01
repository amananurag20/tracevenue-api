const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  createSubBranches,
  getRestaurantsByIds,
  getRestaurantByUrl,
  addSubBranchToMainBranch,
  updateRestaurantWithMediaUrl,
  updateRestaurantWithBannerUrl,
  updateAboutDetails,
  getMediaFilesByRestaurantId,
} = require("../controllers/restaurantController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/", authMiddleware, createRestaurant);
router.post("/", createRestaurant);
router.post("/create-sub-branches", createSubBranches);
router.post("/add-branch", authMiddleware, addSubBranchToMainBranch);
router.get("/", getAllRestaurants);
router.get("/get-media/:id", getMediaFilesByRestaurantId);
router.post("/get-branches-data", getRestaurantsByIds);
router.get("/:id", getRestaurantById);
router.get("/url/:url", getRestaurantByUrl);
router.put("/:id", authMiddleware, updateRestaurant);
router.put("/media/:id", authMiddleware, updateRestaurantWithMediaUrl);
router.put("/banner/:id", authMiddleware, updateRestaurantWithBannerUrl);
router.put("/aboutDetails/:id", authMiddleware, updateAboutDetails);
router.delete("/:id", authMiddleware, deleteRestaurant);

module.exports = router;
