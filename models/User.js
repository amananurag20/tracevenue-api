const mongoose = require("mongoose");
const { USER_TYPES, RES_MEMBERS } = require("../constants");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: false },
    phoneNumber: { type: String, default: "", sparse: true },
    email: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Only apply unique constraint to non-null values
    },
    profileImage: { type: String, default: "" },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: USER_TYPES.user,
      enum: Object.values(USER_TYPES),
    },
    // Restaurant owner specific fields
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // TraceVenue specific fields
    traceVenueStatus: {
      type: String,
      enum: ["not_requested", "pending", "approved", "rejected"],
      default: "not_requested",
    },
    traceVenueRejectionReason: String,
    rejectionReason: { type: String },
    otpOrderId: { type: String }, // For OTP verification using otpless service
    // Restaurant staff specific fields
    staffRole: {
      type: String,
      enum: Object.values(RES_MEMBERS),
      default: null,
    },
    associatedWith: {
      type: [String], // Array of restaurant IDs
      default: [],
    },
    // Guest specific fields
    guestId: { type: String, default: null },
    groupId: { type: String, default: null, required: false },
    password: { type: String, default: null, required: false },
    restaurantDetails: {
      // ... any existing restaurant details
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
