const mongoose = require("mongoose");

const jobsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["venue", "takeaway", "tent", "delivery"],
      required: function () {
        return this.status !== "Draft";
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.status !== "Draft";
      },
    },
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: function () {
        return this.status !== "Draft";
      },
    },
    cuisines: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Cuisine",
      required: function () {
        return this.status !== "Draft";
      },
    },
    menuSections: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: function () {
          return this.status !== "Draft";
        },
      },
    ],
    restaurant_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    autoAppliedRestaurants: [
      {
        restaurantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
          required: true
        },
        appliedAt: {
          type: Date,
          default: Date.now
        },
        matchPercentage: {
          type: Number,
          required: true
        }
      }
    ],
    status: {
      type: String,
      enum: ["Active", "Draft", "Closed", "Past"],
      default: "Active",
    },
    numberOfGuests: {
      type: String,
      // not required
    },
    peopleRange: {
      minPeople: { type: Number },
      maxPeople: { type: Number },
    },
    budget: {
      min: {
        type: Number,
        required: function () {
          return this.status !== "Draft";
        },
      },
      max: {
        type: Number,
        required: function () {
          return this.status !== "Draft";
        },
      },
    },
    services: {
      type: Array,
      required: function () {
        return this.status !== "Draft";
      },
    },
    selectedCities: {
      type: Array,
      required: function () {
        return this.status !== "Draft";
      },
    },
    location: {
      type: {},
    },
    radius: {
      type: String,
    },

    eventDate: [
      {
        type: mongoose.Schema.Types.Mixed,
        of: String,
        required: function () {
          return this.status !== "Draft";
        },
      },
    ],
    eventDateOptions: {
      preferredDates: [
        {
          type: mongoose.Schema.Types.Mixed,
          of: String,
          required: function () {
            return this.status !== "Draft";
          },
        },
      ],
      alternateDates: [
        {
          type: mongoose.Schema.Types.Mixed,
          of: String,
        },
      ],
    },
    specialRequirements: {
      type: String,
    },
    dietaryRequirements: {
      type: [String],
      enum: ["vegOnly", "nonAlcoholicOnly", "glutenFree", "halalOnly"], // etc.
      default: [],
    },

    estimatedMinBudget: {
      type: Number,
    },
    estimatedMaxBudget: {
      type: Number,
    },
    variants: [
      {
        variant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        isShortlisted: {
          type: Boolean,
          default: false,
        },
        isRejected: {
          type: Boolean,
          default: false,
        },
        autoApply: {
          type: Boolean,
          default: false,
        },
        customRequirements: {
          type: [],
          default: [],
        },
      },
    ],
    budgetType: {
      type: String,
      default: "lumpSum",
      enum: ["lumpSum", "perPerson"],
    },
    isSaved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    matched: [
      {
        type: [],
      },
    ],
    cuisineApiData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobsSchema);
