const socketIO = require("socket.io");

// Store connected clients
const clients = new Set();

// Initialize Socket.IO server
const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://app.staging.tracevenue.com', 'https://restaurant.staging.tracevenue.com']
        : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    // Add the socket to the clients set
    clients.add(socket);

    // Store the userId with the socket id if needed
    socket.on("userId", (userId) => {
      socket.userId = userId;
      console.log(`User ${userId} connected`);
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      clients.delete(socket);
      console.log(`Client disconnected`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket connection error:', error);
    });
  });

  return io;
};

// Function to emit order status updates to all clients
const orderStatusUpdate = (userId, orderNo, updatedOrder) => {
  clients.forEach((socket) => {
    socket.emit("orderUpdateEvent", {
      userId,
      orderNo,
      updatedOrder,
    });
  });
};

const newOrderUpdate = (resId, order) => {
  clients.forEach((socket) => {
    socket.emit("newOrderUpdate", { resId, order });
    socket.emit("newOrderUpdateForDashboard", { resId, order });
  });
};
const deleteOrderUpdate = (orderId, userId) => {
  clients.forEach((socket) => {
    socket.emit("deleteOrderUpdate", { orderId, userId });
  });
};
const userDetailsUpdate = (userId, userDetails) => {
  clients.forEach((socket) => {
    socket.emit("userDetailsUpdate", { userId, userDetails });
  });
};
const menuDetailsUpdate = (resId) => {
  clients.forEach((socket) => {
    socket.emit("menuDetailsUpdate", { resId });
  });
};
const menuCategoriesDetailsUpdate = (resId) => {
  clients.forEach((socket) => {
    socket.emit("menuCategoriesDetailsUpdate", { resId });
  });
};
const cancelStatusUpdate = (resId, orderId, updatedOrder) => {
  clients.forEach((socket) => {
    socket.emit("cancelStatusUpdate", {
      resId,
      orderId,
      updatedOrder,
    });
  });
};
const userPaymentUpdate = (resId, orderId, updatedOrder) => {
  clients.forEach((socket) => {
    socket.emit("userPaymentUpdate", {
      resId,
      orderId,
      updatedOrder,
    });
  });
};
const inviteVendor = (vendorId, userId, notifcationData) => {
  clients.forEach((socket) => {
    socket.emit("inviteVendor", {
      vendorId,
      userId,
      notifcationData,
    });
  });
};
const suggestionNotification = (userId, notifcationData) => {
  clients.forEach((socket) => {
    socket.emit("variantSuggestion", {
      userId,
      notifcationData,
    });
  });
};
const suggestionRemoved = (userId, notifcationData) => {
  clients.forEach((socket) => {
    socket.emit("variantSuggestionRemoved", {
      userId,
      notifcationData,
    });
  });
};
const newMessageUpdate = (newMessage) => {
  clients.forEach((socket) => {
    socket.emit("newMessageUpdate", { newMessage });
  });
};
const chatNotification = (senderId, receiverId, jobId, notifcationData) => {
  clients.forEach((socket) => {
    socket.emit("chatNotification", {
      senderId,
      receiverId,
      jobId,
      notifcationData,
    });
  });
};
module.exports = {
  initSocket,
  deleteOrderUpdate,
  newOrderUpdate,
  userDetailsUpdate,
  menuDetailsUpdate,
  menuCategoriesDetailsUpdate,
  userPaymentUpdate,
  newMessageUpdate,
  // orderStatusUpdateForRestaurant,
  orderStatusUpdate,
  cancelStatusUpdate,
  suggestionNotification,
  inviteVendor,
  chatNotification,
  suggestionRemoved,
};
