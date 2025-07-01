const express = require("express");
const router = express.Router();
const qrCodeController = require("../controllers/qrCodeController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/", authMiddleware, qrCodeController.createQRCode);
router.get("/", qrCodeController.getQRCodes);
router.get("/:id", qrCodeController.getQRCodeById);
router.put("/:id", authMiddleware, qrCodeController.updateQRCode);
router.delete("/:id", authMiddleware, qrCodeController.deleteQRCode);

module.exports = router;
