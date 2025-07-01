const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Counter = require("./Counter");
const { VENUE_TYPES } = require("../constants");

const qrCodeSchema = new mongoose.Schema({
  name: { type: String },
  group: { type: String },
  orderType: { type: [String] },
});

const restaurantSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, required: true },
    description: { type: String },
    state: { type: String, required: true },
    image: { type: mongoose.Schema.Types.Mixed },
    phoneNumber: { type: Number, required: true },
    district: { type: String, required: true },
    email: { type: String, required: false },
    streetAddress: { type: String, required: true },
    restaurantURL: { type: String },
    qrCodes: [qrCodeSchema],
    // branches: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Restaurant",
    //   },
    // ],
    location: { lg: { type: Number }, lt: { type: Number } },
    cgst: { type: Number },
    sgst: { type: Number },
    fssai: { type: String },
    gstin: { type: String },
    tin: { type: Number },
    waivedOffReasons: {
      type: [String],
      default: [],
    },
    paymentFirst: {
      type: Boolean,
      default: false,
    },
    paymentUPI: {
      type: String,
      default: "",
    },
    url: { type: String }, // e.g., "/restaurant/<unique_restaurant_name>"

    active: {
      type: Boolean,
      default: true,
    },
    inActiveTime: {
      type: Date,
      default: null, // Use null if you want the field to be empty initially
    },
    venueType: {
      type: String,
      default: "venue",
      enum: VENUE_TYPES,
    },
    bannerUrl: {
      url: { type: String },
      type: { type: String, default: "image" },
      uploadedAt: { type: Date, default: Date.now },
    },
    mediaUrl: [
      {
        url: { type: String },
        type: { type: String, enum: ["image", "video"], default: "image" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rating: { type: Number },
          review: { type: String },
        },
      ],
      default: 0,
    },

    // Auto-apply settings
    autoApplySettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      delay: {
        type: Number,
        default: 0,
        min: 0,
      },
      minMatchPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      visibility: {
        type: String,
        enum: ["all", "public_variants", "private_variants"],
        default: "all",
      },
    },
  },
  {
    _id: true,
  }
);

restaurantSchema.pre("save", async function (next) {
  if (!this.url) {
    const restaurantWords = this.restaurantName.toLowerCase().split(/\s+/);
    const baseUrl = `/restaurant/${restaurantWords.join("-")}`;

    try {
      // Use the counter collection to get the next unique number
      const counter = await Counter.findOneAndUpdate(
        { name: "restaurantUrl" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Create if it doesn't exist
      );

      const nextSuffix = counter.seq;

      // Generate the new URL
      const generatedUrl = `${baseUrl}-${nextSuffix}`;
      this.url = generatedUrl;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
