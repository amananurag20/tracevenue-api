const Group = require("../models/Group");
const QRCode = require("../models/QRCode");
const OrderModel = require("../models/OrderModel");
const { STATUS_ENUM } = require("../constants");

// Create a new Group
exports.createGroup = async (req, res) => {
  try {
    const { restaurant_id, group_name } = req.body;
    const existingGroup = await Group.findOne({ restaurant_id, group_name });
    if (existingGroup) {
      return res
        .status(400)
        .json({ error: "Group name already exists for this restaurant" });
    }
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Groups based on restaurant_id
exports.getGroups = async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const query = restaurant_id ? { restaurant_id } : {};

    // Find all groups based on the query
    const groups = await Group.find(query).lean();

    // Get group ids
    const groupIds = groups.map((group) => group._id);

    // Find related QR codes for each group
    const qrCodes = await QRCode.find({ group_id: { $in: groupIds } }).lean();

    // Attach QR codes to the respective groups without timestamps
    const groupsWithQRCodes = groups.map(
      ({ createdAt, updatedAt, ...group }) => ({
        ...group,
        qrCodes: qrCodes
          .filter(
            (qrCode) => qrCode.group_id.toString() === group._id.toString()
          )
          .map(({ createdAt, updatedAt, ...qrCode }) => qrCode), // Exclude timestamps from QR codes
      })
    );

    res.json(groupsWithQRCodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a Group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Group
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a Group
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const qrCodes = await QRCode.find({ group_id: id });
    const tableIds = qrCodes.map(qrCode => qrCode._id);

    const activePickOrdersCount = await OrderModel.countDocuments({
      orderStatus: {
        $nin: [
          STATUS_ENUM.cancelled,
          STATUS_ENUM.received,
          STATUS_ENUM.delivered,
        ],
      },
      payment: null,
      orderType: "pick-up",
      restaurant_id: group.restaurant_id,
      tableNumber: { $in: tableIds },
    });
    if (activePickOrdersCount > 0) {
      return res.status(409).json({ error: "Unable to delete this group due to active orders." });
    }

    await Group.findByIdAndDelete(id);
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

