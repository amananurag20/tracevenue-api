const cron = require("node-cron");
const Order = require("../models/OrderModel");
const { orderStatusUpdate } = require("../events/communication");
function getLastSixHoursTimestamp() {
  const now = Date.now();
  const sixHoursInMilliseconds = 6 * 60 * 60 * 1000;
  const sixHoursAgoTimestamp = now - sixHoursInMilliseconds;
  return sixHoursAgoTimestamp;
}
async function updateById(id) {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: { orderStatus: "cancelled" } },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    const userId = updatedOrder?.user_id;
    const orderNo = updatedOrder?.orderNo;
    if (userId) {
      orderStatusUpdate(userId, orderNo, updatedOrder);
    }
    // return res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error(`Error updated ID: ${id}`, error);
  }
}

async function updateAllIds() {
  const sixHoursAgoTimestamp = getLastSixHoursTimestamp();
  const orders = await Order.find({
    createdAt: { $lt: sixHoursAgoTimestamp },
    orderStatus: "received",
  });
  const idsToDelete = orders.map((order) => order._id);
  for (const id of idsToDelete) {
    await updateById(id);
  }
}

cron.schedule("*/15 * * * *", () => {
  console.log("Running cron job: Updating IDs");
  updateAllIds();
});
