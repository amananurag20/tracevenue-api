const QRCode = require("../models/QRCode");

// Create a new QR Code
exports.createQRCode = async (req, res) => {
  try {
    const { restaurant_id, table_name } = req.body;

    // Check if a QR code with the same restaurant_id and table_name already exists
    const existingQRCode = await QRCode.findOne({ restaurant_id, table_name });

    if (existingQRCode) {
      return res.status(400).json({
        error: "QR code for this table already exists in this restaurant.",
      });
    }

    // If no existing QR code is found, proceed with creation
    const qrCode = new QRCode(req.body);
    await qrCode.save();
    res.status(201).json(qrCode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all QR Codes
exports.getQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find();
    // .populate("restaurant_id")
    // .populate("group_id");
    res.json(qrCodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a QR Code by ID
exports.getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    // .populate("restaurant_id")
    // .populate("group_id");
    if (!qrCode) return res.status(404).json({ message: "QR Code not found" });
    res.json(qrCode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update QR Code
exports.updateQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!qrCode) return res.status(404).json({ message: "QR Code not found" });
    res.json(qrCode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a QR Code
exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findByIdAndDelete(req.params.id);
    if (!qrCode) return res.status(404).json({ message: "QR Code not found" });
    res.json({ message: "QR Code deleted successfully", deleted: qrCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
