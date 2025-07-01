const express = require("express");
const venueRoute = require("./venue.route");
const packageRoute = require("./package.route");
const eventRoute = require("./event.route");
const masterMenuRoute = require("./masterMenu.routes");
const menuTypeRoute = require("./menuType.routes");
const categoryRoute = require("./category.routes");
const cuisineRoute = require("./cuisine.routes");
const serviceRoute = require("./services.route");
const suggestionRoutes = require("./suggestions.route");
const variantRoute = require("./variant.route");
const itemTypeRoutes = require("./itemType.routes");
const jobRoute = require("./jobs.routes");
const jobContractRoutes = require("./jobContract.routes");
const restaurantServiceRoute = require("./restaurantServices.route");
const restaurantMenuRoute = require("./restaurantMenu.route");
const icons = require("./icons.routes");
const serviceCategory = require("./serviceCategory.routes");
const chat = require("./chat.routes");

const router = express.Router();

// Mount routes
router.use("/venues", venueRoute);
router.use("/package", packageRoute);
router.use("/variant", variantRoute);
router.use("/events", eventRoute);
router.use("/masterMenu", masterMenuRoute);
router.use("/menuTypes", menuTypeRoute);
router.use("/categories", categoryRoute);
router.use("/cuisines", cuisineRoute);
router.use("/suggestions", suggestionRoutes);
router.use("/restaurantMenu", restaurantMenuRoute);
router.use("/services", serviceRoute);
router.use("/jobs", jobRoute);
router.use("/job-contract", jobContractRoutes);
router.use("/itemTypes", itemTypeRoutes);
// vendor route to add service:
router.use("/vendor", restaurantServiceRoute);
router.use("/itemTypes", itemTypeRoutes);

// routes for icons and serviceCategory
router.use("/icons", icons);
router.use("/serviceCategory", serviceCategory);
router.use("/chats", chat);

module.exports = router;
