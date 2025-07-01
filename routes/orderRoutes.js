const express = require("express");
const router = express.Router();
const {
  getOrders,
  settleOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersLastSixMonths,
  getOrdersByFilterType,
  getTopBestSellingOrderItems,
  getRecentOrders,
  getDineInOrdersByRestaurantId,
  getUnsettledOrdersByRestaurant,
  getOrderStatistics,
  getReceivedOrdersByRestaurant,
  getOrderStatisticsByMonth,
  getOrdersUser,
  cancelOrder,
} = require("../controllers/orderController");
const {
  orderSettlement,
  getOptimizedOrders,
  getOrdersDetails,
} = require("../controllers/orderController");
const {
  reassignTableToOrders,
  vacantTable,
  updateOrderType,
  createOrderUser,
} = require("../controllers/orderController-v2");
const { authMiddleware } = require("../middleware/authMiddleware");
router.use(authMiddleware);
// Routes
router.get("/", getOrders);
router.get("/get-orders/", getOrdersUser);
router.get("/lastsixmonths", getOrdersLastSixMonths);
router.get("/topfive", getTopBestSellingOrderItems);
router.get("/ordersbytimerange", getOrdersByFilterType);
router.get("/orderbyrestaurant", getDineInOrdersByRestaurantId); // New route
router.get("/recentorders", getRecentOrders);
router.get("/optimizedOrderList", getOptimizedOrders);
router.get("/unsettledorders", getUnsettledOrdersByRestaurant);
router.get("/orderstatistics", getOrderStatistics);
router.get("/pendingorders", getReceivedOrdersByRestaurant);
router.get("/get-orders-detail", getOrdersDetails);
router.get("/restaurant-analytics", getOrderStatisticsByMonth);
router.post("/", createOrder);
router.post("/create-order-user/", createOrderUser);
router.post("/settle-orders", orderSettlement);
router.post("/reassign-table", reassignTableToOrders);
router.post("/vacant-table", vacantTable);
router.patch("/cancel-order/:id", cancelOrder);
router.patch("/:id", updateOrder);
router.patch("/order-type/:id", updateOrderType);
router.delete("/:id", deleteOrder);

module.exports = router;
