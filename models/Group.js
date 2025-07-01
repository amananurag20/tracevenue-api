const mongoose = require("mongoose");
const QRCode = require("./QRCode");

const groupSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    group_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
// Middleware to delete QR codes linked with group_id before the group is deleted
groupSchema.pre("findOneAndDelete", async function (next) {
  try {
    const groupId = this.getQuery()["_id"];
    await QRCode.deleteMany({ group_id: groupId });
    next();
  } catch (err) {
    next(err);
  }
});
const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
