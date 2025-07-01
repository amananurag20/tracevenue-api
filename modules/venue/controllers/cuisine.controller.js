const { filterVariantsWithAggregation } = require("../helpers/jobMenu.helper");
const Cuisine = require("../models/cuisine.model");

// Create a new cuisine
exports.create = async (req, res) => {
  try {
    const cuisine = new Cuisine(req.body);
    const savedCuisine = await cuisine.save();
    res.status(201).json({
      success: true,
      message: "Cuisine created successfully",
      data: savedCuisine,
    });
  } catch (error) {
    console.error("Error creating cuisine:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Cuisine with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create cuisine",
      error: error.message,
    });
  }
};

// Get all cuisines
exports.findAll = async (req, res) => {
  try {
    const cuisines = await Cuisine.find();
    res.status(200).json({
      success: true,
      message: "Cuisines retrieved successfully",
      data: cuisines,
    });
  } catch (error) {
    console.error("Error fetching cuisines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cuisines",
      error: error.message,
    });
  }
};

// Get all cuisines by eventType and location
exports.findCuisines = async (req, res) => {
  try {
    const { eventTypeId, locations, radius, latitude, longitude } = req.body;
    const result = await filterVariantsWithAggregation({
      eventTypeId,
      locations,
      radius,
      latitude,
      longitude,
      returnTypes: ["cuisines"],
    });

    const cuisines = result?.cuisines || [];
    const allCuisines = await Cuisine.find();
    if (!allCuisines.length) {
      return res.status(200).json({
        success: true,
        message: "No cuisines found",
        data: [],
        popularCuisines: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Cuisines retrieved successfully",
      data: allCuisines,
      popularCuisines: cuisines,
    });
  } catch (error) {
    console.error("Error fetching cuisines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cuisines",
      error: error.message,
    });
  }
};

// Get a single cuisine by ID
exports.findOne = async (req, res) => {
  try {
    const cuisine = await Cuisine.findById(req.params.id);
    if (!cuisine) {
      return res.status(404).json({
        success: false,
        message: "Cuisine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cuisine retrieved successfully",
      data: cuisine,
    });
  } catch (error) {
    console.error("Error fetching cuisine:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid cuisine ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch cuisine",
      error: error.message,
    });
  }
};

// Update a cuisine
exports.update = async (req, res) => {
  try {
    const cuisine = await Cuisine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!cuisine) {
      return res.status(404).json({
        success: false,
        message: "Cuisine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cuisine updated successfully",
      data: cuisine,
    });
  } catch (error) {
    console.error("Error updating cuisine:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Cuisine with this name already exists",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid cuisine ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update cuisine",
      error: error.message,
    });
  }
};

// Delete a cuisine
exports.delete = async (req, res) => {
  try {
    const cuisine = await Cuisine.findByIdAndDelete(req.params.id);

    if (!cuisine) {
      return res.status(404).json({
        success: false,
        message: "Cuisine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cuisine deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cuisine:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid cuisine ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete cuisine",
      error: error.message,
    });
  }
};
