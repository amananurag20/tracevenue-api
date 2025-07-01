const { default: mongoose } = require("mongoose");
const Staff = require("../models/StaffRoleModel");

exports.createNewRole = async (req, res) => {
  const { restaurantId, staffType } = req.body;
  try {
    const newRole = new Staff({
      restaurantId: restaurantId,
      staffType: staffType,
    });
    await newRole.save();
    return res.json({ message: "Role created successfully", newRole });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurantObjectId = mongoose.Types.ObjectId.isValid(restaurantId)
      ? new mongoose.Types.ObjectId(restaurantId)
      : restaurantId;

    // Query the Staff collection
    const roles = await Staff.find({ restaurantId: restaurantObjectId });
    return res.json({ roles });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching roles." });
  }
};
exports.deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Staff.findByIdAndDelete(id);
    return res.json({ message: "Role deleted successfully", role });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the role." });
  }
};
