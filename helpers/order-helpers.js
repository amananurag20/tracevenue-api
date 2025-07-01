const Order = require("../models/OrderModel");

async function generateOrderNo() {
  const currentDate = new Date();
  const dateString = currentDate.toISOString().split("T")[0].replace(/-/g, ""); // Format: YYYYMMDD

  // Find the last order placed today
  const lastOrder = await Order.findOne({
    orderNo: { $regex: `${dateString}` },
  })
    .sort({ createdAt: -1 })
    .exec();

  let orderCount = 0;
  if (lastOrder) {
    const lastOrderNo = lastOrder.orderNo;
    const match = lastOrderNo.split("-");
    if (match && match.length >= 2) {
      orderCount = parseInt(match[1]);
    }
  }

  // Increment the order count
  const newOrderNo = `ORD#: ${dateString}-${String(orderCount + 1).padStart(
    4,
    "0"
  )}`;
  return newOrderNo;
}

module.exports = {
  generateOrderNo,
};
