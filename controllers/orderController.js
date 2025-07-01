const Order = require("../models/OrderModel");
const {
  orderStatusUpdate,
  newOrderUpdate,
  deleteOrderUpdate,
  cancelStatusUpdate,
  userPaymentUpdate,
} = require("../events/communication");
const User = require("../models/User");
const moment = require("moment");
const { STATUS_ENUM, orderTypeEnum } = require("../constants");
const Restaurant = require("../models/RestaurantModels");
const {
  calculateTotalwithTax,
  calculateSettlement,
} = require("../helpers/amount-calculations");
const { generateOrderNo } = require("../helpers/order-helpers");
const Transaction = require("../models/transaction");
const { loggers } = require("winston");
const { generateGuestNo } = require("../helpers/generate-guestno");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("../models/QRCode");
const Notification = require("../modules/notification/models/notification");

// Modify the items to be an array of objects containing only the name property
const getOrders = async (req, res) => {
  try {
    const {
      orderId,
      orderNo,
      restaurant_id,
      status,
      user_id,
      group,
      unsettled,
      tableNumber,
      category_id,
      month,
      year,
      today,
      new: newOrder,
      lastId,
      search,
      page = 1,
      limit,
      timestamp,
      kotId,
      orderType,
      hourFilter,
      groupId,
    } = req.query;

    const filters = { items: { $exists: true } };

    if (restaurant_id) filters.restaurant_id = restaurant_id;
    // const restaurant = await Restaurant.findById(restaurant_id);
    if (orderId) filters._id = orderId;
    if (orderNo) filters.orderNo = orderNo;
    if (status) filters.orderStatus = status;
    if (user_id) filters.user_id = user_id;
    if (tableNumber) {
      filters.tableNumber = tableNumber;
    }
    if (category_id) filters["items.category_id"] = category_id;
    if (orderType) filters.orderType = orderType;

    // Handle hour filter
    if (hourFilter) {
      const hours = parseInt(hourFilter);
      if (hours === 24 || hours === 48) {
        const now = new Date();
        const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
        filters.updatedAt = { $gte: startTime, $lte: now };
      }
    }

    // Handle month and year filters
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filters.$or = [
        { createdAt: { $gte: startDate, $lte: endDate } },
        { updatedAt: { $gte: startDate, $lte: endDate } },
      ];
    }

    // Handle new orders with lastId
    if (newOrder && newOrder.toLowerCase() === "true" && lastId) {
      filters._id = { $gt: lastId };
    }

    // Handle unsettled orders
    if (unsettled && unsettled.toLowerCase() === "true") {
      filters.payment = null;
      filters.orderStatus = { $ne: STATUS_ENUM.cancelled };
    }

    // Handle group filter
    if (group && group.toLowerCase() === "true") {
      filters.orderStatus = { $ne: STATUS_ENUM.cancelled };

      if (tableNumber) {
        filters.tableNumber = tableNumber;
      } else {
        filters.tableNumber = null;
      }
    }
    if (groupId) {
      filters.group = groupId;
    } else {
      if (!orderId) {
        const qrCode = await QRCode.findOne({ _id: tableNumber }).lean();
        filters.group = qrCode?.group
          ? { $ne: null, $in: [qrCode.group] }
          : null;
      }
    }
    // Handle timestamp filtering
    if (timestamp) {
      const timestampDate = new Date(parseInt(timestamp));
      filters.createdAt = { $gte: timestampDate };
    }
    if (groupId && group && !tableNumber && !kotId) {
      filters.tableNumber = "";
    }

    // Handle KOT ID special case
    if (kotId) {
      const singleOrder = await Order.findById(kotId)
        .populate({
          path: "transactions",
          model: Transaction,
        })
        .lean();

      let allOrders = [singleOrder];
      if (singleOrder.user_id) {
        if (singleOrder.orderType !== "dine-in") {
          delete filters.tableNumber;
        }
        allOrders = await Order.find({
          ...filters,
          // tableNumber: singleOrder.tableNumber,
          // user_id: singleOrder.user_id,
          // orderType:
          //   singleOrder.orderType === "dine-in" ? "dine-in" : "pick-up",
          ...(singleOrder.orderType === "dine-in"
            ? { tableNumber: singleOrder.tableNumber }
            : { user_id: singleOrder.user_id }),
        })
          .populate({
            path: "user_id",
            select: "userName phoneNumber email _id",
            model: User,
          })
          .populate({
            path: "transactions",
            model: Transaction,
          })
          .lean();
      }

      // Check for paid status
      allOrders = allOrders.map((order) => ({
        ...order,
        isPaid: order.transactions.length > 0 && order?.payment?.due === 0,
      }));
      // console.log(allOrders?.map((item) => item.isPaid));
      // Filter out delivered and paid orders
      allOrders = allOrders.filter(
        (item) => !(item.isPaid && item.orderStatus === STATUS_ENUM.delivered)
      );
      // console.log(allOrders?.length);

      // Modify items to be array of objects containing only the name property
      if (!orderId) {
        allOrders = allOrders.map((order) => ({
          ...order,
          items: order.items.map((item) => ({
            name: item.name,
            quantityLevel: item.quantityLevel,
            quantity: item.quantity,
            instructions: item.instructions,
            addOns: item.addOns,
            basePrice: item.basePrice,
            ...(item?.total && { total: item.total }),
            taxable: item.taxable,
            tax: item.tax,
            addOns: item.addOns,
            isDiscountEligible: item.isDiscountEligible,
          })),
        }));
      }

      return res
        .status(200)
        .send({ orders: allOrders, totalCount: allOrders.length });
    }
    // Main query to fetch orders with filters
    const ordersQuery = Order.find(filters)
      .sort({ createdAt: -1 })
      .populate({
        path: "user_id",
        select: "userName phoneNumber email _id",
        model: User,
      })
      .populate({
        path: "transactions",
        model: Transaction,
      })
      .lean();

    // Pagination logic
    if (limit) {
      const parsedLimit = parseInt(limit);
      ordersQuery.skip((page - 1) * parsedLimit).limit(parsedLimit);
    }

    // Fetch orders
    let orders = await ordersQuery;

    // Modify items to be array of objects containing only the name property
    orders = orders.map((order) => {
      if (!orderId) {
        return {
          ...order,
          items: order.items.map((item) => ({
            name: item.name,
            quantityLevel: item.quantityLevel,
            quantity: item.quantity,
            instructions: item.instructions,
            addOns: item.addOns,
            basePrice: item.basePrice,
            ...(item?.total && { total: item.total }),
            taxable: item.taxable,
            tax: item.tax,
            addOns: item.addOns,
            isDiscountEligible: item.isDiscountEligible,
          })),
        };
      }
      return {
        ...order,
        isPaid: order.transactions.length > 0,
      };
    });

    // Filter out delivered and paid orders when grouped
    if (group && group.toLowerCase() === "true") {
      orders = orders.filter(
        (item) => !(item.isPaid && item.orderStatus === STATUS_ENUM.delivered)
      );
    }

    // Search filtering
    if (search) {
      const searchRegex = new RegExp(`^${search}|.*${search}.*`, "i");
      const filteredOrders = orders.filter(
        (order) =>
          searchRegex.test(order.orderNo) ||
          (order.user_id &&
            (searchRegex.test(order.user_id.userName) ||
              searchRegex.test(order.user_id.phoneNumber)))
      );
      return res.json({
        orders: filteredOrders,
        totalCount: filteredOrders.length,
      });
    }

    // Count documents and send the response
    const totalCount = await Order.countDocuments(filters);
    res.json({ orders, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getOrdersUser = async (req, res) => {
  try {
    const {
      orderId,
      orderNo,
      restaurant_id,
      status,
      user_id,
      group,
      unsettled,
      tableNumber,
      category_id,
      month,
      year,
      today,
      new: newOrder,
      lastId,
      search,
      page = 1,
      limit,
      timestamp,
      kotId,
      orderType,
      hourFilter,
      groupId,
    } = req.query;

    const filters = { items: { $exists: true } };

    if (restaurant_id) filters.restaurant_id = restaurant_id;
    if (orderId) filters._id = orderId;
    if (orderNo) filters.orderNo = orderNo;
    if (status) {
      filters.orderStatus = {
        $in: ["InProcess", "received", "ready"],
      };
    }
    if (user_id) filters.user_id = user_id;
    if (tableNumber) {
      filters.tableNumber = tableNumber;
    }
    if (category_id) filters["items.category_id"] = category_id;
    if (orderType) filters.orderType = orderType;

    // Handle hour filter
    if (hourFilter) {
      const hours = parseInt(hourFilter);
      if (hours === 24 || hours === 48) {
        const now = new Date();
        const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
        filters.updatedAt = { $gte: startTime, $lte: now };
      }
    }

    // Handle month and year filters
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filters.$or = [
        { createdAt: { $gte: startDate, $lte: endDate } },
        { updatedAt: { $gte: startDate, $lte: endDate } },
      ];
    }

    // Handle new orders with lastId
    if (newOrder && newOrder.toLowerCase() === "true" && lastId) {
      filters._id = { $gt: lastId };
    }

    // Handle unsettled orders
    if (unsettled && unsettled.toLowerCase() === "true") {
      filters.payment = null;
      filters.orderStatus = { $ne: STATUS_ENUM.cancelled };
    }

    // Handle group filter
    if (group && group.toLowerCase() === "true") {
      filters.orderStatus = { $ne: STATUS_ENUM.cancelled };

      if (tableNumber) {
        filters.tableNumber = tableNumber;
      } else {
        filters.tableNumber = null;
      }
    }

    // Handle timestamp filtering
    if (timestamp) {
      const timestampDate = new Date(parseInt(timestamp));
      filters.createdAt = { $gte: timestampDate };
    }

    // Handle KOT ID special case
    if (kotId) {
      const singleOrder = await Order.findById(kotId)
        .populate({
          path: "transactions",
          model: Transaction,
        })
        .lean();

      let allOrders = [singleOrder];
      if (singleOrder.user_id) {
        if (singleOrder.orderType !== "dine-in") {
          delete filters.tableNumber;
        }
        allOrders = await Order.find({
          ...filters,
          // tableNumber: singleOrder.tableNumber,
          // user_id: singleOrder.user_id,
          // orderType:
          //   singleOrder.orderType === "dine-in" ? "dine-in" : "pick-up",
          ...(singleOrder.orderType === "dine-in"
            ? { tableNumber: singleOrder.tableNumber }
            : { user_id: singleOrder.user_id }),
        })
          .populate({
            path: "user_id",
            select: "userName phoneNumber email _id",
            model: User,
          })
          .populate({
            path: "transactions",
            model: Transaction,
          })
          .lean();
      }

      // Check for paid status
      allOrders = allOrders.map((order) => ({
        ...order,
        isPaid: order.transactions.length > 0,
      }));

      // Filter out delivered and paid orders
      allOrders = allOrders.filter(
        (item) => !(item.isPaid && item.orderStatus === STATUS_ENUM.delivered)
      );

      // Modify items to be array of objects containing only the name property
      if (!orderId) {
        allOrders = allOrders.map((order) => ({
          ...order,
          items: order.items.map((item) => ({
            name: item.name,
            quantityLevel: item.quantityLevel,
            quantity: item.quantity,
            instructions: item.instructions,
            addOns: item.addOns,
          })), // Change items to array of objects with only name
        }));
      }

      return res
        .status(200)
        .send({ orders: allOrders, totalCount: allOrders.length });
    }

    // Main query to fetch orders with filters
    const ordersQuery = Order.find(filters)
      .sort({ createdAt: -1 })
      .populate({
        path: "user_id",
        select: "userName phoneNumber email _id",
        model: User,
      })
      .populate({
        path: "transactions",
        model: Transaction,
      })
      .lean();

    // Pagination logic
    if (limit) {
      const parsedLimit = parseInt(limit);
      ordersQuery.skip((page - 1) * parsedLimit).limit(parsedLimit);
    }

    // Fetch orders
    let orders = await ordersQuery;

    // Modify items to be array of objects containing only the name property
    orders = orders.map((order) => {
      if (!orderId) {
        return {
          ...order,
          items: order.items.map((item) => ({
            name: item.name,
            quantityLevel: item.quantityLevel,
            quantity: item.quantity,
            instructions: item.instructions,
            addOns: item.addOns,
          })), // Change items to array of objects with only name
        };
      }
      return {
        ...order,
        isPaid: order.transactions.length > 0,
      };
    });

    // Filter out delivered and paid orders when grouped
    if (group && group.toLowerCase() === "true") {
      orders = orders.filter(
        (item) => !(item.isPaid && item.orderStatus === STATUS_ENUM.delivered)
      );
    }

    // Search filtering
    if (search) {
      const searchRegex = new RegExp(`^${search}|.*${search}.*`, "i");
      const filteredOrders = orders.filter(
        (order) =>
          searchRegex.test(order.orderNo) ||
          (order.user_id &&
            (searchRegex.test(order.user_id.userName) ||
              searchRegex.test(order.user_id.phoneNumber)))
      );
      return res.json({
        orders: filteredOrders,
        totalCount: filteredOrders.length,
      });
    }

    // Count documents and send the response
    const totalCount = await Order.countDocuments(filters);
    res.json({ orders, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersDetails = async (req, res) => {
  const { orderIds } = req.query;

  if (!orderIds) {
    return res.status(400).json({ error: "No orderIds provided" });
  }

  const orderIdArray = orderIds.split(",");

  const orders = await Order.find(
    { _id: { $in: orderIdArray } },
    {
      // Include only the relevant fields
      orderNo: 1,
      tableName: 1,
      orderType: 1,
      payment: 1,
      total: 1,
      orderStatus: 1,
      items: {
        name: 1,
        quantity: 1,
        basePrice: 1,
        addOns: 1,
        instructions: 1,
        taxable: 1,
        isDiscountEligible: 1,
        tax: 1,
      },
      // Include timestamps
      createdAt: 1,
      updatedAt: 1,
      kot: 1,
      user_id: 1,
      taxes: 1,
    }
  ).populate({
    path: "user_id",
    select: "userName phoneNumber email _id",
    model: User,
  });

  // Respond with only the selected fields
  return res.json({ orders });
};

const getUnsettledOrdersByRestaurant = async (req, res) => {
  try {
    const {
      restaurant_id,
      orderType,
      searchTerm = "",
      page = 1,
      limit,
    } = req.query;

    if (!restaurant_id) {
      return res.status(400).json({ message: "restaurant_id is required" });
    }

    const baseFilters = {
      restaurant_id,
      payment: null,
      orderStatus: { $nin: [STATUS_ENUM.cancelled, STATUS_ENUM.received] },
      items: { $exists: true },
    };

    // Add specific orderType filter if provided
    const filters = { ...baseFilters };
    if (orderType) {
      filters.orderType = orderType;
    }

    // Fetch the initial orders
    let unsettledOrdersQuery = Order.find(filters)
      .sort({ createdAt: -1 })
      .populate({
        path: "user_id",
        select: "userName phoneNumber email _id",
        model: User,
      })
      .populate({
        path: "transactions",
        model: Transaction,
      })
      .lean();

    // Apply pagination
    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      unsettledOrdersQuery.skip((page - 1) * parsedLimit).limit(parsedLimit);
    }

    let unsettledOrders = await unsettledOrdersQuery;

    // Apply search filtering
    if (searchTerm) {
      unsettledOrders = unsettledOrders.filter((order) => {
        const tableNameMatch = order?.tableName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const orderNoMatch = order?.orderNo?.includes(searchTerm);
        const phoneNumberMatch =
          order?.user_id?.phoneNumber?.includes(searchTerm);
        const userNameMatch = order?.user_id?.userName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        return (
          tableNameMatch || orderNoMatch || phoneNumberMatch || userNameMatch
        );
      });
    }

    // Map additional fields for response
    unsettledOrders = unsettledOrders.map((order) => ({
      ...order,
      isPaid: order.transactions.length > 0,
      items: order.items.map((item) => ({
        name: item.name,
        quantityLevel: item.quantityLevel,
        quantity: item.quantity,
        tax: item.tax,
        taxable: item.taxable,
        taxableAmount: item.taxableAmount,
      })),
    }));
    const searchFilters = searchTerm
      ? {
          $or: [
            { tableName: { $regex: searchTerm, $options: "i" } },
            { orderNo: { $regex: searchTerm } },
            { "userDetails.phoneNumber": { $regex: searchTerm } },
            { "userDetails.userName": { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};
    // Fetch counts for all order types
    const countsByOrderType = await Order.aggregate([
      { $match: { ...baseFilters } },
      {
        $addFields: {
          user_id: { $toObjectId: "$user_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $match: { ...searchFilters },
      },
      {
        $group: {
          _id: "$orderType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Default order types with count 0
    const defaultOrderTypes = {
      "dine-in": 0,
      "pick-up": 0,
      online: 0,
    };

    // Populate the counts into default object
    countsByOrderType.forEach((type) => {
      defaultOrderTypes[type._id] = type.count;
    });
    // Total count of filtered orders
    const totalCount = await Order.countDocuments(filters);

    res.json({
      orders: unsettledOrders,
      totalCount,
      orderTypeCounts: defaultOrderTypes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const { restaurant_id, limit } = req.query;

    // Define filter for today's date
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const filters = { updatedAt: { $gte: todayStart, $lte: todayEnd } };

    if (restaurant_id) filters.restaurant_id = restaurant_id;

    // Aggregation to count orders by orderType
    const orderTypeAggregation = await Order.aggregate([
      { $match: filters },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      { $project: { _id: 0, orderType: "$_id", count: 1 } },
    ]);

    const orderTypeCounts = orderTypeAggregation.reduce((acc, curr) => {
      acc[curr.orderType] = curr.count;
      return acc;
    }, {});

    // Query to get the most recent orders
    const recentOrders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit || 5)
      .populate({
        path: "user_id",
        select: "userName phoneNumber email _id",
        model: User,
      })
      .populate({
        path: "transactions",
        model: Transaction,
      })
      .lean();

    // Modify items to be an array of objects containing only the name property
    recentOrders.forEach((order) => {
      order.items = order.items.map((item) => ({
        name: item.name,
        quantityLevel: item.quantityLevel,
        quantity: item.quantity,
      })); // Change items to array of objects with only name
      order.isPaid = order.transactions.length > 0;
    });

    res.json({ orderTypeCounts, recentOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceivedOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurant_id, page = 1, limit } = req.query;

    if (!restaurant_id) {
      return res.status(400).json({ message: "restaurant_id is required" });
    }

    const filters = {
      restaurant_id,
      orderStatus: STATUS_ENUM.received,
      items: { $exists: true },
    };

    const receivedOrdersQuery = Order.find(filters)
      .sort({ createdAt: -1 })
      .populate({
        path: "user_id",
        select: "userName phoneNumber email _id",
        model: User,
      })
      .lean();

    if (limit) {
      const parsedLimit = parseInt(limit);
      receivedOrdersQuery.skip((page - 1) * parsedLimit).limit(parsedLimit);
    }
    const receivedOrders = await receivedOrdersQuery;
    receivedOrders.forEach((order) => {
      order.items = order.items.map((item) => {
        return { name: item.name };
      });
    });

    const totalCount = await Order.countDocuments(filters);

    res.json({ orders: receivedOrders, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOptimizedOrders = async (req, res) => {
  try {
    const {
      restaurant_id,
      status,
      orderType,
      hourFilter,
      search,
      tableNumber,
    } = req.query;

    // Ensure that restaurant_id is present
    if (!restaurant_id) {
      return res.status(400).json({ message: "restaurant_id is required" });
    }

    // Basic filters with restaurant_id and orderStatus
    const filters = {
      restaurant_id,
    };

    // Handle hourFilter to fetch orders in the last 24 or 48 hours
    if (hourFilter) {
      const hours = parseInt(hourFilter);
      if (hours === 24 || hours === 48) {
        const now = new Date();
        const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
        filters.updatedAt = { $gte: startTime, $lte: now };
      }
    }

    // Add orderStatus to filters if provided
    if (status) {
      filters.orderStatus = status;
    }

    // Add tableNumber to filters if provided
    if (tableNumber) {
      filters.tableNumber = tableNumber;
    }

    // Add orderType to filters if provided
    if (orderType) {
      filters.orderType = orderType;
    }

    // Fetch orders based on filters
    let orders = await Order.find(filters)
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate({
        path: "user_id",
        select: "userName phoneNumber email _id",
        model: User,
      })
      .lean();

    // If search is provided, apply the search filter
    if (search) {
      const searchRegex = new RegExp(`^${search}|.*${search}.*`, "i");
      orders = orders.filter(
        (order) =>
          searchRegex.test(order.orderNo) ||
          (order.user_id &&
            (searchRegex.test(order.user_id.userName) ||
              searchRegex.test(order.user_id.phoneNumber)))
      );
    }

    // Ensure that items field is included and filtered if necessary
    // orders.forEach((order) => {
    //   if (order.items) {
    //     // Remove unnecessary fields from items if needed
    //     order.items = order.items.map((item) => {
    //       const { updated_at, taxes, ...itemData } = item;
    //       return itemData;
    //     });
    //   }
    // });

    orders = orders.map((order) => {
      if (!orders._id) {
        return {
          ...order,
          items: order.items.map((item) => ({ name: item.name })), // Format items as array of names
        };
      }
      return {
        ...order,
        isPaid: order.transactions.length > 0,
      };
    });
    // Return the filtered orders and total count
    return res.status(200).json({ orders, totalCount: orders.length });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const getDineInOrdersByRestaurantId = async (req, res) => {
  try {
    const { restaurant_id, page = 1, limit } = req.query;
    if (!restaurant_id) {
      return res.status(400).json({ message: "restaurant_id is required" });
    }
    const qrCodes = await QRCode.find({ restaurant_id }).lean();
    const runningTableGroupIds = qrCodes.map((qrCode) => qrCode.group);
    const filters = {
      restaurant_id,
      orderType: "dine-in",
      group: {
        $ne: null,
        $in: runningTableGroupIds,
      },
      $or: [
        { orderStatus: { $nin: ["cancelled"] } },
        {
          $and: [{ orderStatus: "delivered" }, { "payment.type": "due" }],
        },
      ],
      $nor: [
        {
          orderStatus: "delivered",
          "payment.type": "paid",
        },
      ],
    };

    const ordersQuery = Order.find(filters).sort({ createdAt: -1 });
    if (limit) {
      const parsedLimit = parseInt(limit);
      ordersQuery.skip((page - 1) * parsedLimit).limit(parsedLimit);
    }
    let orders = await ordersQuery;
    orders = orders.map((order) => ({
      orderStatus: order.orderStatus,
      orderId: order._id,
      orderNo: order.orderNo,
      tableNumber: order.tableNumber,
      total: order.payment?.due
        ? order.payment?.due
        : order.payment?.paid && !order.payment?.due
        ? 0
        : order.total,
      createdAt: order.createdAt,
      orderType: order.orderType,
      paymentType: order.payment.type,
    }));
    const totalCount = await Order.countDocuments(filters);
    res.json({ orders, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function createOrder(req, res) {
  try {
    const { payment, tableName, restaurant_id, user_id, items, onlyPayment } =
      req.body;
    // Parallelize independent queries with Promise.all
    const [restaurantData] = await Promise.all([
      Restaurant.findOne({ _id: restaurant_id }).lean(), // use lean() for faster query response
    ]);

    if (restaurantData?.active === false) {
      return res.status(400).json({ message: "Restaurant is not active." });
    }

    if (onlyPayment) {
      // Early exit for payment-only requests
      await settleOrder({}, req.body, {
        cgst: restaurantData.cgst,
        sgst: restaurantData.sgst,
      });
      return res.status(201).json({ type: "payment" });
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
        });
      }
    } else if (req.body.orderType === orderTypeEnum.PickUp) {
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

    if (payment) {
      events.push(
        settleOrder(
          {},
          { ...req.body },
          {
            cgst: restaurantData.cgst,
            sgst: restaurantData.sgst,
          }
        )
      );
    }

    await Promise.all(events);

    return res
      .status(201)
      .json({ type: "new", order: { ...newOrder.toObject(), user_id: user } });
    // }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function orderSettlement(req, res) {
  try {
    const { payment } = req.body;
    const restaurantData = await Restaurant.findOne({
      _id: req.body.restaurant_id,
    });
    const tableData = await Restaurant.findOne({
      _id: req.body.restaurant_id,
      qrCodes: { $elemMatch: { name: req.body.tableName } },
    });

    let tableName = req.body.tableName;
    if (tableData) {
      const table = tableData.qrCodes.find(
        (item) => item.name === req.body.tableName
      );
      if (table) {
        tableName = table._id;
      }
    }

    const existedOrder = false;

    if (existedOrder) {
      const updatedOrder = await Order.findByIdAndUpdate(
        existedOrder._id,
        {
          $set: {
            items: [...existedOrder.items, ...req.body.items],
            total: calculateTotalwithTax(
              [...existedOrder.items, ...req.body.items],
              { cgst: restaurantData.cgst, sgst: restaurantData.sgst }
            ),
          },
        },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Emit order status update
      orderStatusUpdate(
        updatedOrder.user_id,
        updatedOrder.orderNo,
        updatedOrder
      );
      orderStatusUpdate(
        updatedOrder.restaurant_id,
        updatedOrder.orderNo,
        updatedOrder
      );
      if (payment)
        await settleOrder(
          updatedOrder,
          { ...req.body },
          { cgst: restaurantData.cgst, sgst: restaurantData.sgst }
        );

      return res.json({ type: "update", order: updatedOrder });
    } else {
      if (req.body.onlyPayment) {
        await settleOrder(
          {},
          { ...req.body },
          { cgst: restaurantData.cgst, sgst: restaurantData.sgst }
        );
        return res
          .status(201)
          .json({ type: "new", order: {}, settlementOnly: true });
      }
      // Create new order
      const orderNo = await generateOrderNo();
      let order = {};
      if (req.body.orderType === orderTypeEnum.DineIn) {
        const qrCode = await QRCode.findOne({
          _id: req.body.tableNumber,
        }).lean();
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
          });
        }
      } else if (req.body.orderType === orderTypeEnum.PickUp) {
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
          });
        }
      }

      const newOrder = await order.save();

      const user = await User.findById(req.body.user_id);
      // Prepare order update payload
      const orderUpdatePayload = {
        id: newOrder?._id,
        _id: newOrder?._id,
        orderNo: orderNo,
        orderStatus: req.body.orderStatus,
        total: req.body.total,
        orderDate: req.body.orderDate,
        orderTime: req.body.orderTime,
        items: req.body.items,
        tableNumber: req.body.tableNumber,
        tableName: req.body.tableName,
        restaurant_id: req.body.restaurant_id,
        orderType: req.body.orderType,
        taxes: req.body.taxes,
        payment,
      };

      // Add user details if user exists
      if (user) {
        orderUpdatePayload.user_id = user;
      }

      await settleOrder(
        {},
        {
          ...req.body,
          kotOrders: {
            ...req.body.kotOrders,
            all: [...req.body.kotOrders.all, newOrder._id],
          },
        },
        { cgst: restaurantData.cgst, sgst: restaurantData.sgst }
      );
      // Emit new order update
      newOrderUpdate(req.body.restaurant_id, newOrder);
      return res.status(201).json({
        type: "new",
        order: { ...newOrder.toObject(), user_id: user },
      });
    }
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(400).json({ message: error.message });
  }
}

async function updateOrder(req, res) {
  try {
    // Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

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
    if (req?.body?.paymentDoneByUser) {
      userPaymentUpdate(
        updatedOrderObj?.restaurant_id,
        updatedOrderObj?._id,
        updatedOrderObj
      );
    }
    // Return the modified order object with user details
    res.json(updatedOrderObj);
  } catch (error) {
    console.error("Update Error:", error); // Log any errors for debugging
    res.status(400).json({ message: error.message });
  }
}

async function deleteOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    deleteOrderUpdate(req.params.id, order.user_id);
    await Order.findByIdAndDelete(req.params.id);
    res.json({ status: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function cancelOrder(req, res) {
  try {
    const { resId, cancelOrderReason } = req.body; // Get the cancel reason from the request body

    // Validate if cancelOrderReason is provided (optional but good for validation)
    if (!cancelOrderReason) {
      return res
        .status(400)
        .json({ message: "Cancel order reason is required" });
    }

    // Find the order by its ID
    const order = await Order.findById(req.params.id);

    // Check if the order was found
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already canceled
    if (order.orderStatus === STATUS_ENUM.cancelled) {
      return res.status(400).json({ message: "Order is already canceled" });
    }

    // Update the order status to 'cancelled' and add the cancelOrderReason
    order.orderStatus = STATUS_ENUM.cancelled;
    order.cancelOrderReason = cancelOrderReason;

    // Save the updated order
    const canceledOrder = await order.save();

    // Convert Mongoose document to a plain JavaScript object
    const canceledOrderObj = canceledOrder.toObject();

    // Fetch user details based on the user_id in the canceled order
    const user = await User.findById(canceledOrderObj.user_id);

    if (user) {
      // Append user details to the canceled order object for the response
      canceledOrderObj.user_id = {
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        userId: user._id,
      };
    }

    // Emit order cancellation update (optional)
    const orderNo = canceledOrder.orderNo;
    const orderId = canceledOrder._id;
    orderStatusUpdate(user?._id, orderNo, canceledOrderObj);
    cancelStatusUpdate(resId, orderId, canceledOrderObj);
    // Return the modified canceled order object with user details
    res.json(canceledOrderObj);
  } catch (error) {
    console.error("Cancel Error:", error); // Log any errors for debugging
    res.status(400).json({ message: error.message });
  }
}

async function getOrdersLastSixMonths(req, res) {
  try {
    const { month, year } = req.query;
    const filters = {
      payment: { $exists: true, $ne: null },
    };
    const ordersByMonth = {};

    if (req.query.orderId) filters.orderNo = req.query.orderId;
    if (req.query.restaurant_id)
      filters.restaurant_id = req.query.restaurant_id;
    if (req.query.status) filters.orderStatus = req.query.status;
    if (req.query.user_id) filters.user_id = req.query.user_id;
    if (req.query.tableNumber) filters.tableNumber = req.query.tableNumber;
    if (req.query.category_id) {
      filters["items.category_id"] = req.query.category_id;
    }

    if (month && year) {
      const today = new Date();
      const startDate = new Date(year, month - 1, 1); // Month is 0-based index
      startDate.setHours(0, 0, 0, 0); // Set time to start of the day

      // Iterate from 6 months ago to the given month
      for (let i = 0; i < 6; i++) {
        const currentMonth = startDate.getMonth() - i;
        const currentYear = startDate.getFullYear();
        const currentStartDate = new Date(currentYear, currentMonth, 1); // Start of the month
        const currentEndDate = new Date(
          currentYear,
          currentMonth + 1,
          0,
          23,
          59,
          59,
          999
        ); // End of the month

        filters.createdAt = { $gte: currentStartDate, $lte: currentEndDate };

        const orders = await Order.find(filters).sort({ _id: -1 }).exec();

        ordersByMonth[
          currentStartDate.toLocaleString("en-US", { month: "long" })
        ] = orders;
      }
    }

    res.json(ordersByMonth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getTopBestSellingOrderItems(req, res) {
  const { restaurant_id, startDate, endDate, filterType } = req.query;
  let dateFilter = {};

  if (filterType === "Day" && startDate) {
    const start = moment(startDate).startOf("day").toDate(); // Ensure it's in Date format
    const end = endDate
      ? moment(endDate).endOf("day").toDate() // End of day
      : moment(startDate).endOf("day").toDate();
    dateFilter = { createdAt: { $gte: start, $lte: end } };
  }

  try {
    const pipeline = [
      {
        $match: {
          restaurant_id,
          payment: { $exists: true, $ne: null },
          // orderStatus: "delivered",
          ...dateFilter,
        },
      },
      {
        $unwind: "$items", // Unwind the items array
      },
      {
        $addFields: {
          // Add order taxes to each unwound item
          "items.orderTaxes": "$taxes",
        },
      },
      {
        $addFields: {
          // Calculate the total sales for each item based on the total field or basePrice
          totalSales: {
            $cond: {
              if: { $gt: ["$items.total", 0] }, // If total is present
              then: {
                $add: [
                  { $multiply: ["$items.total", "$items.quantity"] },
                  {
                    $multiply: [
                      { $multiply: ["$items.total", "$items.quantity"] },
                      {
                        $divide: [
                          {
                            $add: [
                              "$items.orderTaxes.cgst",
                              "$items.orderTaxes.sgst",
                            ],
                          },
                          100,
                        ],
                      },
                    ],
                  },
                ],
              },
              else: {
                $add: [
                  { $multiply: ["$items.basePrice", "$items.quantity"] },
                  {
                    $multiply: [
                      { $multiply: ["$items.basePrice", "$items.quantity"] },
                      {
                        $divide: [
                          {
                            $add: [
                              "$items.orderTaxes.cgst",
                              "$items.orderTaxes.sgst",
                            ],
                          },
                          100,
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$items.name",
          totalSales: { $sum: "$totalSales" },
          quantitySold: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: { quantitySold: -1 },
      },
      {
        $facet: {
          topItems: [{ $limit: 5 }],
          others: [{ $skip: 5 }],
        },
      },
      {
        $project: {
          topItems: 1,
          othersSales: { $sum: "$others.totalSales" },
          othersCount: { $size: "$others" },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    const totalSales = await Order.aggregate([
      {
        $match: {
          restaurant_id,
          // orderStatus: "delivered",
          payment: { $exists: true, $ne: null },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$payment.paid" },
        },
      },
    ]);

    res.json({
      sortedItems: result[0]?.topItems || [],
      totalCount: result[0]?.othersCount + result[0]?.topItems.length || 0,
      othersCount: result[0]?.othersCount || 0,
      othersSales: result[0]?.othersSales || 0,
      totalSales: totalSales[0]?.totalSales || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getOrdersByFilterType = async (req, res) => {
  try {
    const {
      restaurant_id,
      filterType,
      startDate,
      endDate,
      month,
      startTime,
      endTime,
    } = req.query;
    const filters = {
      restaurant_id,
      orderStatus: { $ne: "cancelled" },
      payment: { $exists: true, $ne: null },
    };

    let ordersMetrics = {};

    switch (filterType) {
      case "Day":
        const isValidStartDate = moment(startDate).isValid();
        const isValidEndDate = moment(endDate).isValid();

        if (!isValidStartDate || !isValidEndDate) {
          throw new Error("Invalid startDate or endDate provided.");
        }

        const allDates = [];
        const startMoment = moment(startDate);
        const endMoment = moment(endDate);

        while (startMoment.isSameOrBefore(endMoment)) {
          allDates.push(startMoment.format("YYYY-MM-DD"));
          startMoment.add(1, "days");
        }

        const combinedFilters = [];
        for (const date of allDates) {
          const combinedStartTime =
            startTime !== endTime
              ? moment(`${date} ${startTime}`, "YYYY-MM-DD hh:mm A").toDate()
              : moment(date).startOf("day").toDate();
          const combinedEndTime =
            endTime !== startTime
              ? moment(`${date} ${endTime}`, "YYYY-MM-DD hh:mm A").toDate()
              : moment(date).endOf("day").toDate();

          combinedFilters.push({
            createdAt: {
              $gte: combinedStartTime,
              $lt: combinedEndTime,
            },
          });
        }

        filters.$or = combinedFilters;

        const dayOrders = await fetchOrders(filters);

        ordersMetrics = {
          currentOrders: calculateMetrics(dayOrders),
          allData: calculateAllData(dayOrders.orders, "hour"),
        };
        break;

      case "Month":
        let monthStart, previousMonthStart, monthEnd, previousMonthEnd;
        if (month) {
          monthStart = moment()
            .month(month - 1)
            .startOf("month");
          monthEnd = moment()
            .month(month - 1)
            .endOf("month");
          previousMonthStart = moment()
            .month(month - 2)
            .startOf("month");
          previousMonthEnd = moment()
            .month(month - 2)
            .endOf("month");
        } else {
          monthStart = moment(startDate).startOf("month");
          monthEnd = moment(startDate).endOf("month");
          previousMonthStart = moment(startDate)
            .subtract(1, "month")
            .startOf("month");
          previousMonthEnd = moment(startDate)
            .subtract(1, "month")
            .endOf("month");
        }

        const currentMonthOrders = await fetchOrders({
          ...filters,
          createdAt: {
            $gte: monthStart.toDate(),
            $lt: monthEnd.toDate(),
          },
        });

        const previousMonthOrders = await fetchOrders({
          ...filters,
          createdAt: {
            $gte: previousMonthStart.toDate(),
            $lt: previousMonthEnd.toDate(),
          },
        });

        const allOrders = await fetchOrders({
          ...filters,
        });

        const currentMonthAllOrders = allOrders.orders.filter((order) => {
          const orderDate = moment(order.createdAt);
          return (
            orderDate.isSame(monthStart, "month") &&
            order.orderStatus !== "cancelled"
          );
        });

        ordersMetrics.currentOrders = calculateMetrics(currentMonthOrders);
        ordersMetrics.previousOrders = calculateMetrics(previousMonthOrders);
        ordersMetrics.allData = calculateAllData(
          currentMonthAllOrders,
          "month"
        );

        break;

      default:
        throw new Error("Invalid filterType provided.");
    }

    res.json({ ordersMetrics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const settleOrder = async (order, body, restaurantData) => {
  const { payment, kotOrders: orderIds } = body;
  const paymentType = Number.isFinite(payment?.due) ? "due" : "paid";

  // Find all orders to get the total for each
  const orders = await Order.find({ _id: { $in: orderIds.all } });
  const ordersForPayment = orders.filter(
    (item) =>
      (item && !item?.payment) ||
      (item && item?.payment && !item?.payment?.paid) ||
      (item && item?.payment && item?.payment?.due)
  );
  const unpaidIds = ordersForPayment.map((item) => item?._id);
  const paidOrders = orders.filter((item) => !unpaidIds.includes(item?._id));
  const updatedPayments = calculateSettlement(
    ordersForPayment,
    payment,
    body?.user_id
  );
  if (unpaidIds && unpaidIds.length && payment) {
    const transaction = new Transaction(
      {
        orders: unpaidIds,
        totalAmount: orderIds.totalAmount,
        paymentMethod: body.paymentMode,
        ...payment,
        type: paymentType,
        restaurant_id: body.restaurant_id,
        user_id: body.user_id,
      },
      0
    );
    await transaction.save();
  }
  const userWithSettlement = new Set();

  // Create an array of promises for updating orders and users
  const promises = updatedPayments.map(
    async ({ _id, payment, user_id, total }) => {
      const updateData = { payment, user_id, total };

      if (body.completeOrder) {
        updateData.orderStatus = STATUS_ENUM.delivered;
      }

      const order = await Order.findById(_id);
      if (
        (body.orderType === orderTypeEnum.PickUp ||
          body.orderType === orderTypeEnum.Online) &&
        order &&
        !userWithSettlement.has(order.user_id)
      ) {
        await User.findOneAndUpdate(
          { _id: order.user_id },
          { $set: { groupId: null } },
          { new: true }
        );
        userWithSettlement.add(order.user_id);
      }

      return Order.updateOne({ _id }, { $set: updateData });
    }
  );

  // Await all promises to resolve
  await Promise.all(promises);
  await Promise.all(
    paidOrders.map(({ _id }) => {
      // Prepare the update object only for orderStatus if completeOrder is true
      const updateData = {};

      // If completeOrder is true, set the order status to 'delivered'
      if (body.completeOrder) {
        updateData.orderStatus = STATUS_ENUM.delivered;
      }

      // Perform the update only if there's something to update
      if (Object.keys(updateData).length > 0) {
        return Order.updateOne({ _id }, { $set: updateData });
      }
    })
  );

  // Fetch updated orders
  const updatedOrders = await Order.find({ _id: { $in: orderIds.all } });

  // Run orderStatusUpdate for each updated order
  updatedOrders.forEach((updatedOrder) => {
    orderStatusUpdate(updatedOrder.user_id, updatedOrder.orderNo, updatedOrder);
  });
};

// Function to fetch orders based on filters
const fetchOrders = async (filters) => {
  const totalCount = await Order.countDocuments(filters);
  const orders = await Order.find(filters).populate({
    path: "user_id",
    select: "userName phoneNumber email",
    model: User,
  });
  return { orders, totalCount };
};

// Function to calculate metrics from orders
const calculateMetrics = (ordersData) => {
  return {
    ordersCount: ordersData.totalCount,
    ordersTotalSales: ordersData.orders
      .filter(
        (order) =>
          order?.payment?.paid &&
          order?.orderStatus !== STATUS_ENUM.received &&
          order?.orderStatus !== STATUS_ENUM.cancelled
      )
      .reduce((total, order) => total + (order?.payment?.paid || 0), 0),
    uniqueUser: new Set(ordersData.orders.map((order) => order.user_id)).size,
  };
};

// Function to calculate all data
const calculateAllData = (orders, period) => {
  const allData = initializeAllData(period);

  orders.forEach((order) => {
    let periodKey;
    switch (period) {
      case "hour":
        const hour = moment(order.createdAt).hour();
        periodKey = getHourInterval(hour);
        break;
      case "weekday":
        periodKey = moment(order.createdAt).format("dddd");
        break;
      case "month":
        periodKey = moment(order.createdAt).format("MMMM");
        break;
    }

    if (allData[periodKey]) {
      allData[periodKey].ordersCount++;
      allData[periodKey].sales += order?.payment?.paid || 0;
      allData[periodKey].orders.push(order);
    }
  });

  return Object.keys(allData).map((key) => ({
    time: key,
    ordersCount: allData[key].ordersCount,
    sales: allData[key].sales,
    orders: allData[key].orders,
  }));
};

// Function to initialize all data
const initializeAllData = (period) => {
  let allData = {};

  switch (period) {
    case "hour":
      for (let i = 0; i < 24; i += 2) {
        allData[getHourInterval(i)] = {
          ordersCount: 0,
          sales: 0,
          orders: [],
        };
      }
      break;
    case "weekday":
      moment.weekdays().forEach((day) => {
        allData[day] = { ordersCount: 0, sales: 0, orders: [] };
      });
      break;
    case "month":
      moment.months().forEach((month) => {
        allData[month] = { ordersCount: 0, sales: 0, orders: [] };
      });
      break;
  }

  return allData;
};

// Helper function to get the two-hour interval
const getHourInterval = (hour) => {
  const startHour = hour - (hour % 2);
  const endHour = (startHour + 2) % 24;
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
};

// Helper function to format hour
const formatHour = (hour) => {
  const period = hour < 12 ? "AM" : "PM";
  let formattedHour = hour % 12;
  if (formattedHour === 0) formattedHour = 12;
  return `${formattedHour} ${period}`;
};

const getOrderStatistics = async (req, res) => {
  try {
    const { restaurant_id } = req.query;

    if (!restaurant_id) {
      return res.status(400).json({ message: "restaurant_id is required" });
    }

    // Order statistics aggregation pipeline
    const orderAggregationPipeline = [
      { $match: { restaurant_id } },
      {
        $facet: {
          unsettled: [
            {
              $match: {
                payment: null,
                orderStatus: {
                  $nin: [STATUS_ENUM.cancelled, STATUS_ENUM.received],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: "$total" },
              },
            },
          ],
          pending: [
            {
              $match: {
                orderStatus: {
                  $in: [STATUS_ENUM.received],
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          unsettledCount: { $arrayElemAt: ["$unsettled.count", 0] },
          unsettledTotalAmount: { $arrayElemAt: ["$unsettled.totalAmount", 0] },
          pendingCount: { $arrayElemAt: ["$pending.count", 0] },
        },
      },
    ];

    // Get notification count - corrected for array field
    const notificationCount = await Notification.countDocuments({
      $or: [{ to_ids: { $in: [restaurant_id] } }],
      seen: false,
    });

    const [orderResult] = await Order.aggregate(orderAggregationPipeline);

    res.json({
      unsettledCount: orderResult?.unsettledCount || 0,
      unsettledTotalAmount:
        (orderResult?.unsettledTotalAmount &&
          orderResult.unsettledTotalAmount.toFixed(2)) ||
        0,
      pendingCount: orderResult?.pendingCount || 0,
      notificationCount: notificationCount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
async function getOrderStatisticsByMonth(req, res) {
  try {
    const { restaurant_id, month } = req.query;

    if (!restaurant_id || !month) {
      return res
        .status(400)
        .json({ error: "restaurant_id and month are required" });
    }

    const currentYear = moment().year();
    const startOfMonth = moment(
      `${currentYear}-${month}-01`,
      "YYYY-MM-DD"
    ).startOf("month");
    const endOfMonth = moment(startOfMonth).endOf("month");
    const startOfPreviousMonth = moment(startOfMonth)
      .subtract(1, "month")
      .startOf("month");
    const endOfPreviousMonth = moment(startOfPreviousMonth).endOf("month");
    const sixMonthsAgo = moment(startOfMonth)
      .subtract(5, "months")
      .startOf("month");

    // Perform all aggregations in parallel
    const [
      currentAndPreviousMonthStats,
      customerCounts,
      topSellingItems,
      lastSixMonthsSales,
    ] = await Promise.all([
      getMonthStats(restaurant_id, startOfPreviousMonth, endOfMonth),
      getCustomerCounts(restaurant_id, startOfPreviousMonth, endOfMonth),
      getTopBestSelling(restaurant_id, startOfMonth, endOfMonth),
      getLastSixMonthsSales(restaurant_id, sixMonthsAgo, endOfMonth),
    ]);

    res.json({
      currentMonth: {
        ...currentAndPreviousMonthStats.current,
        customerCount: customerCounts.current,
      },
      previousMonth: {
        ...currentAndPreviousMonthStats.previous,
        customerCount: customerCounts.previous,
      },
      topSellingItems,
      lastSixMonthsSales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMonthStats(restaurant_id, startDate, endDate) {
  const stats = await Order.aggregate([
    {
      $match: {
        restaurant_id,
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        updatedAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        payment: { $exists: true, $ne: null },
      },
    },
    {
      $facet: {
        orderCounts: [
          {
            $group: {
              _id: {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      startDate.clone().add(1, "month").toDate(),
                    ],
                  },
                  "current",
                  "previous",
                ],
              },
              orderCount: { $sum: 1 },
            },
          },
        ],
        sales: [
          {
            $match: {
              orderStatus: { $nin: ["cancelled"] },
            },
          },
          {
            $group: {
              _id: {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      startDate.clone().add(1, "month").toDate(),
                    ],
                  },
                  "current",
                  "previous",
                ],
              },
              sales: { $sum: "$payment.paid" },
            },
          },
        ],
      },
    },
    {
      $project: {
        combinedStats: {
          $map: {
            input: { $setUnion: ["$orderCounts", "$sales"] },
            as: "stat",
            in: {
              _id: "$$stat._id",
              orderCount: {
                $cond: {
                  if: { $isArray: "$orderCounts" },
                  then: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$orderCounts",
                          cond: { $eq: ["$$this._id", "$$stat._id"] },
                        },
                      },
                      0,
                    ],
                  },
                  else: 0,
                },
              },
              sales: {
                $cond: {
                  if: { $isArray: "$sales" },
                  then: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$sales",
                          cond: { $eq: ["$$this._id", "$$stat._id"] },
                        },
                      },
                      0,
                    ],
                  },
                  else: 0,
                },
              },
            },
          },
        },
      },
    },
  ]);

  const result = {
    current: { orderCount: 0, sales: 0 },
    previous: { orderCount: 0, sales: 0 },
  };

  stats[0].combinedStats.forEach((stat) => {
    result[stat._id] = {
      orderCount: stat.orderCount ? stat.orderCount.orderCount : 0,
      sales: stat.sales ? stat.sales.sales : 0,
    };
  });

  return result;
}

async function getCustomerCounts(restaurant_id, startDate, endDate) {
  const customerCounts = await Order.aggregate([
    {
      $match: {
        restaurant_id,
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      },
    },
    {
      $group: {
        _id: {
          period: {
            $cond: [
              {
                $gte: [
                  "$createdAt",
                  startDate.clone().add(1, "month").toDate(),
                ],
              },
              "current",
              "previous",
            ],
          },
          user_id: "$user_id",
        },
      },
    },
    {
      $group: {
        _id: "$_id.period",
        customerCount: { $sum: 1 },
      },
    },
  ]);

  const result = {
    current: 0,
    previous: 0,
  };
  customerCounts.forEach((count) => {
    result[count._id] = count.customerCount;
  });

  return result;
}

async function getTopBestSelling(restaurant_id, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        restaurant_id,
        payment: { $exists: true, $ne: null },
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        orderStatus: { $nin: [STATUS_ENUM.cancelled, STATUS_ENUM.received] },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalSales: {
          $sum: {
            $multiply: [
              { $ifNull: ["$items.total", "$items.basePrice"] },
              "$items.quantity",
              // {
              //   $add: [
              //     1,
              //     { $divide: [{ $add: ["$taxes.cgst", "$taxes.sgst"] }, 100] },
              //   ],
              // },
            ],
          },
        },
        quantitySold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { quantitySold: -1 } },
    {
      $group: {
        _id: null,
        topItems: { $push: "$$ROOT" },
        totalSales: { $sum: "$totalSales" },
      },
    },
    {
      $project: {
        topItems: { $slice: ["$topItems", 5] },
        othersSales: {
          $subtract: [
            "$totalSales",
            { $sum: { $slice: ["$topItems.totalSales", 5] } },
          ],
        },
        totalSales: 1,
      },
    },
  ];

  const result = await Order.aggregate(pipeline);

  return result[0]
    ? {
        sortedItems: result[0].topItems,
        totalCount: result[0].topItems.length,
        othersCount:
          result[0].topItems.length > 5 ? result[0].topItems.length - 5 : 0,
        othersSales: result[0].othersSales,
        totalSales: result[0].totalSales,
      }
    : {
        sortedItems: [],
        totalCount: 0,
        othersCount: 0,
        othersSales: 0,
        totalSales: 0,
      };
}

async function getLastSixMonthsSales(restaurant_id, startDate, endDate) {
  const result = await Order.aggregate([
    {
      $match: {
        restaurant_id,
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        payment: { $exists: true, $ne: null },
        orderStatus: { $nin: [STATUS_ENUM.cancelled, STATUS_ENUM.received] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        sales: { $sum: "$payment.paid" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesByMonth = {};
  const lastSixMonths = Array.from({ length: 6 }, (_, i) =>
    moment(endDate).subtract(i, "months").format("YYYY-MM")
  ).reverse();

  lastSixMonths.forEach((month) => {
    salesByMonth[moment(month, "YYYY-MM").format("MMMM").toLowerCase()] = 0;
  });

  result.forEach((item) => {
    const monthName = moment(item._id, "YYYY-MM").format("MMMM").toLowerCase();
    if (monthName in salesByMonth) {
      salesByMonth[monthName] = item.sales;
    }
  });

  return salesByMonth;
}

module.exports = {
  getOrders,
  getOrdersUser,
  createOrder,
  updateOrder,
  deleteOrder,
  cancelOrder,
  getOrdersByFilterType,
  getOrdersLastSixMonths,
  getTopBestSellingOrderItems,
  orderSettlement,
  getDineInOrdersByRestaurantId,
  getOptimizedOrders,
  getRecentOrders,
  getUnsettledOrdersByRestaurant,
  getOrderStatistics,
  getReceivedOrdersByRestaurant,
  getOrdersDetails,
  getOrderStatisticsByMonth,
};
