const Order = require("../models/OrderModel");
const {
  orderStatusUpdate,
  newOrderUpdate,
  deleteOrderUpdate,
} = require("../events/communication");
const User = require("../models/User");
const moment = require("moment");
const { STATUS_ENUM, orderTypeEnum } = require("../constants");
const Restaurant = require("../models/RestaurantModels");
const {
  calculateTotalwithTax,
  calculatePayableAmount,
} = require("../helpers/amount-calculations");
const { generateOrderNo } = require("../helpers/order-helpers");
const Transaction = require("../models/transaction");
const QRCode = require("../models/QRCode");
const { v4: uuidv4 } = require("uuid");
// Modify the items to be an array of objects containing only the name property
async function reassignTableToOrders(req, res) {
  try {
    const { orderIds, tableName, tableNumber, orderType } = req.body;
    const orders = await Order.find({ _id: { $in: orderIds } });
    const isDineIn =
      orders.filter((order) => order.orderType === orderTypeEnum.DineIn)
        .length === orders.length;
    const isPickup =
      orders.filter((order) => order.orderType === orderTypeEnum.PickUp)
        .length === orders.length;
    const qrCode = await QRCode.findOne({
      _id: tableNumber,
    });
    const [ordersOnAnotherTable] = await Promise.all([
      Order.find({
        tableName,
        tableNumber,
        $or: [
          // Case 1: payment doesn't exist and orderStatus is not delivered or cancelled
          {
            payment: { $exists: false },
            group: {
              $ne: null,
              $in: [qrCode.group],
            },
            orderStatus: { $nin: ["delivered", "cancelled"] },
          },
          // Case 2: payment exists and orderStatus is not delivered or cancelled
          {
            payment: { $exists: true },
            orderStatus: { $nin: ["delivered", "cancelled"] },
            group: {
              $ne: null,
              $in: [qrCode.group],
            },
          },
          // Case 3: payment exists, orderStatus is delivered, but payment type is due
          {
            "payment.type": "due",
            orderStatus: "delivered",
            group: {
              $ne: null,
              $in: [qrCode.group],
            },
          },
        ],
      }),
    ]);
    if (isDineIn && qrCode.orderType === orderTypeEnum.DineIn) {
      if (ordersOnAnotherTable.length > 0) {
        return res.status(400).json({ message: "Table is occupied" });
      } else {
        if (qrCode.group) {
          await Order.updateMany(
            { _id: { $in: orderIds } },
            { tableName, tableNumber, orderType, group: qrCode.group },
            { new: true }
          );
        } else {
          const groupId = uuidv4();
          await QRCode.findOneAndUpdate(
            { _id: tableNumber },
            { $set: { group: groupId } },
            { new: true }
          );
          await Order.updateMany(
            { _id: { $in: orderIds } },
            { tableName, tableNumber, orderType, group: groupId },
            { new: true }
          );
        }
      }
    } else if (isDineIn && qrCode.orderType === orderTypeEnum.PickUp) {
      return res.status(400).json({ message: "Cannot reassign to pick up" });
    } else if (isPickup && qrCode.orderType === orderTypeEnum.DineIn) {
      if (ordersOnAnotherTable.length > 0) {
        return res.status(400).json({ message: "Table is occupied" });
      } else {
        if (qrCode.group) {
          await Order.updateMany(
            { _id: { $in: orderIds } },
            { tableName, tableNumber, orderType, group: qrCode.group },
            { new: true }
          );
        } else {
          const groupId = uuidv4();
          await QRCode.findOneAndUpdate(
            { _id: tableNumber },
            { $set: { group: groupId } },
            { new: true }
          );
          await Order.updateMany(
            { _id: { $in: orderIds } },
            { tableName, tableNumber, orderType, group: groupId },
            { new: true }
          );
        }
      }
    } else if (isPickup && qrCode.orderType === orderTypeEnum.PickUp) {
      if (ordersOnAnotherTable.length > 0) {
        return res.status(400).json({ message: "Table is occupied" });
      } else {
        await Order.updateMany(
          { _id: { $in: orderIds } },
          { tableName, tableNumber, orderType },
          { new: true }
        );
      }
    }

    res.json({ status: true, message: "Table assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}
async function vacantTable(req, res) {
  try {
    const { orderIds } = req.body;
    const orders = await Order.find({ _id: { $in: orderIds } });

    // Use a set to track which tables have already been vacated
    const vacatedTables = new Set();
    for (const order of orders) {
      const { orderType, tableNumber } = order;

      if (orderType === orderTypeEnum.DineIn) {
        // Check if the table has already been vacated
        if (!vacatedTables.has(tableNumber)) {
          // Update the QRCode only once for each unique tableNumber
          await QRCode.findOneAndUpdate(
            { _id: tableNumber },
            { $set: { group: null } },
            { new: true }
          );
          vacatedTables.add(tableNumber); // Mark this table as vacated
        }
        // Update the order status to "delivered"
        await Order.findOneAndUpdate(
          { _id: order._id },
          { $set: { orderStatus: "delivered" } },
          { new: true }
        );
      }
      // Uncomment and handle the pickup case if necessary
      else if (orderType === orderTypeEnum.PickUp) {
        // Handle pick-up orders
        await Order.findOneAndUpdate(
          { _id: order._id },
          { $set: { orderStatus: "delivered" } },
          { new: true }
        );
      }
    }

    res.json({ status: true, message: "Table has been vacated successfully." });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function updateOrderType(req, res) {
  try {
    const { orderType, tableNumber, tableName } = req.body;
    const qrCode = await QRCode.findOne({ _id: tableNumber });
    let updatedOrder = {};

    if (qrCode && qrCode.orderType === orderTypeEnum.DineIn) {
      const [ordersOnAnotherTable] = await Promise.all([
        Order.find({
          tableName,
          tableNumber,
          $or: [
            // Case 1: payment doesn't exist and orderStatus is not delivered or cancelled
            {
              payment: { $exists: false },
              group: {
                $ne: null,
                $in: [qrCode.group],
              },
              orderStatus: { $nin: ["delivered", "cancelled"] },
            },
            // Case 2: payment exists and orderStatus is not delivered or cancelled
            {
              payment: { $exists: true },
              orderStatus: { $nin: ["delivered", "cancelled"] },
              group: {
                $ne: null,
                $in: [qrCode.group],
              },
            },
            // Case 3: payment exists, orderStatus is delivered, but payment type is due
            {
              "payment.type": "due",
              orderStatus: "delivered",
              group: {
                $ne: null,
                $in: [qrCode.group],
              },
            },
          ],
        }),
      ]);
      if (ordersOnAnotherTable.length > 0) {
        return res.status(400).json({ message: "Table is occupied" });
      } else {
        if (qrCode.group) {
          updatedOrder = await Order.findOneAndUpdate(
            { _id: req.params.id }, // Change from $in to req.params.id
            { tableName, tableNumber, orderType, group: qrCode.group },
            { new: true }
          );
        } else {
          const groupId = uuidv4();
          await QRCode.findOneAndUpdate(
            { _id: tableNumber },
            { $set: { group: groupId } },
            { new: true }
          );
          updatedOrder = await Order.findOneAndUpdate(
            { _id: req.params.id }, // Change from $in to req.params.id
            { tableName, tableNumber, orderType, group: groupId },
            { new: true }
          );
        }
      }
    }

    // Find and update the order

    // Check if the order was found and updated

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Convert Mongoose document to a plain JavaScript object
    const updatedOrderObj = updatedOrder.toObject();

    // Fetch user details based on the user_id in the updated order
    const user = await User.findById(updatedOrderObj.user_id);

    if (user) {
      // Append user details to the updated order object for the response
      updatedOrderObj.user_id = {
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        userId: user._id,
      };
    }

    // Emit order status update
    const orderNo = updatedOrder.orderNo;
    orderStatusUpdate(user?._id, orderNo, updatedOrderObj);

    // Return the modified order object with user details
    res.json(updatedOrderObj);
  } catch (error) {
    console.error("Update Error:", error); // Log any errors for debugging
    res.status(400).json({ message: error.message });
  }
}
async function createOrderUser(req, res) {
  try {
    const {
      payment,
      restaurant_id,
      user_id,
      items,
      confirmOrder = false,
      paymentDoneByUser,
    } = req.body;
    // Parallelize independent queries with Promise.all
    const [restaurantData] = await Promise.all([
      Restaurant.findOne({ _id: restaurant_id }).lean(), // use lean() for faster query response
    ]);
    if (restaurantData?.active === false) {
      return res.status(400).json({ message: "Restaurant is not active." });
    }
    if (restaurantData?.paymentFirst && !confirmOrder) {
      const orderTotalPayableAmount = calculatePayableAmount(items);
      return res.status(200).json({
        askToPayFirst: true,
        paymentUPI:
          `upi://pay?pa=${restaurantData?.paymentUPI}&am=${orderTotalPayableAmount}&cu=INR` ??
          "",
      });
    }

    const orderNo = await generateOrderNo();
    let order = {};
    if (req.body.orderType === orderTypeEnum.DineIn) {
      const qrCode = await QRCode.findOne({ _id: req.body.tableNumber }).lean();
      //case 1: GroupId does not exist
      if (!qrCode?.group) {
        const groupId = uuidv4();
        await QRCode.findOneAndUpdate(
          { _id: req.body.tableNumber },
          {
            $set: {
              group: groupId,
            },
          }
        );
        order = new Order({
          ...req.body,
          orderNo,
          group: groupId,
          payment: null,
          ...(restaurantData?.paymentFirst &&
            confirmOrder == true && { paymentDoneByUser: paymentDoneByUser }),
        });
      }
      //case 2: GroupId exists
      else {
        const groupId = qrCode.group;
        order = new Order({
          ...req.body,
          orderNo,
          group: groupId,
          payment: null,
          ...(restaurantData?.paymentFirst &&
            confirmOrder == true && { paymentDoneByUser: paymentDoneByUser }),
        });
      }
    } else if (
      req.body.orderType === orderTypeEnum.PickUp ||
      req.body.orderType === orderTypeEnum.Online
    ) {
      const user = await User.findOne({ _id: req.body.user_id }).lean();
      //case 1: GroupId does not exist
      if (!user?.groupId) {
        const groupId = uuidv4();
        await User.findOneAndUpdate(
          { _id: req.body.user_id },
          {
            $set: {
              groupId: groupId,
            },
          }
        );
        order = new Order({
          ...req.body,
          orderNo,
          group: groupId,
          payment: null,

          ...(restaurantData?.paymentFirst &&
            confirmOrder == true && { paymentDoneByUser: true }),
        });
      }
      //case 2: GroupId exists
      else {
        const groupId = user.groupId;
        order = new Order({
          ...req.body,
          orderNo,
          group: groupId,
          payment: null,
          ...(restaurantData?.paymentFirst && { paymentDoneByUser: false }),
        });
      }
    }

    const newOrder = await order.save();

    const user = await User.findById(req.body.user_id).lean(); // use lean() to reduce memory footprint
    const orderUpdatePayload = {
      _id: newOrder._id,
      id: newOrder._id,
      orderNo,
      orderStatus: req.body.orderStatus,
      total: req.body.total,
      orderDate: req.body.orderDate,
      orderTime: req.body.orderTime,
      items,
      tableNumber: req.body.tableNumber,
      tableName: req.body.tableName,
      restaurant_id,
      orderType: req.body.orderType,
      taxes: req.body.taxes,
      payment,
    };

    if (user) {
      orderUpdatePayload.user_id = {
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        userId: user_id,
        _id: user_id,
      };
    }

    const events = [
      newOrderUpdate(restaurant_id, {
        ...newOrder.toObject(),
        user_id: user,
      }),
    ];

    await Promise.all(events);

    return res.status(201).json({
      order: { ...newOrder.toObject(), user_id: user },
      askToPayFirst: restaurantData?.paymentFirst,
    });
    // }
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  vacantTable,
  createOrderUser,
  reassignTableToOrders,
  updateOrderType,
};
