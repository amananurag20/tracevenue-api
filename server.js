const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("./utils/logger");
const errorLogger = require("./middleware/errorMiddleware");
const requestMiddleware = require("./middleware/requestMiddleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const configureServer = require("./config/configure");
const userRoutes = require("./routes/userRoutes");
const foodCategoryRoutes = require("./routes/foodCategoryRoutes");
const foodItemsRoutes = require("./routes/foodItemsRoutes");
const foodAddOnRoutes = require("./routes/foodAddOnRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationUserRoutes = require("./routes/notificationUserRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tableGroupRoutes = require("./routes/groupRoutes");
const qrCodeRoutes = require("./routes/qrCodeRoutes");
const authRoutes = require("./routes/auth-routes");
const staffRoleRoutes = require("./routes/staffRoleRoutes");
const notificationRoutes = require("./modules/notification/routes/notificationRoutes");
const loggerRoutes = require("./routes/loggerRoutes");
const mapRoutes = require("./modules/auth/routes/map.routes.js");
const tracevenueRoutes = require("./modules/venue/routes/index");
const mediaRoutes = require("./modules/cms/media.routes");
const path = require("path");
const s3Routes = require('./modules/cms/routes/upload.routes.js');
const schedulerRoutes = require('./modules/jobSheduler/routes/scheduler.routes');

const { initSocket } = require("./events/communication");
const { initializeScheduler } = require("./modules/jobSheduler/scheduler");
require("dotenv").config();
require("./scheduled-tasks/cron-jobs.js");

const app = express();
const { PORT, MONGODB_URL } = configureServer();

// Advanced request tracking and logging middleware
app.use(requestMiddleware);

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://app.staging.tracevenue.com', 'https://restaurant.staging.tracevenue.com',"http://localhost:4200", "http://localhost:5173", "http://app.amananurag.store"]
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  })
);

// Increase payload limit for file uploads
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Serve media files
app.use("/media", express.static(path.join(__dirname, "uploads/media")));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/food-category", foodCategoryRoutes);
app.use("/sub-category", subCategoryRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/food-items-add-on", foodAddOnRoutes);
app.use("/food-items", foodItemsRoutes);
app.use("/reviews", reviewRoutes);
app.use("/notifications", notificationRoutes);
app.use("/notification-user", notificationUserRoutes);
app.use("/orders", orderRoutes);
app.use("/qr-code", qrCodeRoutes);
app.use("/table-group", tableGroupRoutes);
app.use("/staff-role", staffRoleRoutes);
app.use("/api/v1/traceVenue", tracevenueRoutes);
app.use("/tracevenue", mapRoutes);
app.use("/api/media", mediaRoutes);
app.use('/api', s3Routes);
app.use('/api/scheduler', schedulerRoutes);

// Logging dashboard route
app.use("/logs", loggerRoutes);
app.use("/api/logs", loggerRoutes);

// Root route with basic info
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "TraceVenue API is running",
    version: "1.0.0",
  });
});

// 404 handler for unknown routes
app.use("*", (req, res) => {
  logger.http(req, `Route not found: ${req.method} ${req.originalUrl}`, {
    statusCode: 404,
    code: "HTTP",
    type: "NotFound",
  });

  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler middleware
app.use(errorLogger);

const server = require("http").createServer(app);

// Initialize socket after all middleware
server.on('upgrade', (request, socket, head) => {
  // Log WebSocket upgrade attempts
  console.log('WebSocket upgrade attempt:', request.url);
  
  // Handle potential errors
  socket.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

initSocket(server);
initializeScheduler();

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  logger.error(err, {
    code: "Exception",
    type: err.name || "UncaughtException",
  });
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(err, {
    code: "Exception",
    type: err.name || "UnhandledRejection",
  });
  console.error("UNHANDLED REJECTION:", err);
  server.close(() => {
    process.exit(1);
  });
});

mongoose
  .connect(MONGODB_URL)
  .then(async () => {
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(error, {
      code: "Exception",
      type: "MongoConnectionError",
    });
  });
