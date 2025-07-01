const FoodCategory = require("../../../models/FoodCategory");
const Restaurant = require("../../../models/RestaurantModels");
const User = require("../../../models/User");
const {
  filterVariantsWithAggregation,
  restaurantsInLocation,
} = require("../helpers/jobMenu.helper");
const Package = require("../models/package.model");
const {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  isVenueExist,
} = require("../services/venue.service");

const createVenueController = async (req, res) => {
  try {
    const { userId, ...venueData } = req.body;

    // Check if venue exists with same phone number
    const venue = await isVenueExist(venueData.phoneNumber);
    if (venue) {
      return res.status(200).json({
        success: false,
        message: "Venue already exists with this phone number",
      });
    }

    // Create the venue
    const newVenue = await createVenue(venueData);

    // Update user with restaurant association and role
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { associatedWith: newVenue._id },
        role: "restaurant",
        staffRole: "owner",
      });
    }

    res.status(201).json({
      success: true,
      message: "Venue registered successfully",
      data: newVenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getVenuesController = async (req, res) => {
  try {
    const { location } = req.query;

    // Construct the query object
    let query = {};
    if (location) {
      query.$or = [
        { state: { $regex: new RegExp(`^${location}$`, "i") } },
        { district: { $regex: new RegExp(`^${location}$`, "i") } },
        { city: { $regex: new RegExp(`^${location}$`, "i") } },
      ];
    }

    const venues = await Restaurant.find(
      query, // Apply the state filter if provided
      "_id restaurantName state district phoneNumber streetAddress active"
    );

    const venueData = await Promise.all(
      venues.map(async (venue) => {
        const foodCategories = await FoodCategory.find(
          { restaurant_id: venue._id },
          "name"
        );

        return {
          ...venue.toObject(),
          foodCategories: [...new Set(foodCategories.map((fc) => fc.name))], // Store as a Set to remove duplicates
        };
      })
    );

    res.status(200).json(venueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getVenuesByLocation = async (req, res) => {
  try {
    const { locations, matched, radius, latitude, longitude } = req.body;

    let restaurantIds = [];
    // let restaurantsWithLocation = [];
    if (locations?.length > 0) {
      restaurantIds =
        (await restaurantsInLocation({
          locations,
          radius,
          latitude,
          longitude,
        })) || [];
    }
    // If matched data is provided and we don't have restaurantIds from aggregation
    // if (matched && matched.length > 0) {
    //   // Get venue_ids from matched data
    //   const matchedVenueIds = matched.map((item) => item.venue_id);

    //   // Step 1: First try to get data from aggregation
    //   const result =
    //     (await filterVariantsWithAggregation({
    //       locations,
    //       radius,
    //       latitude,
    //       longitude,
    //       returnTypes: ["restaurants"],
    //     })) || [];

    //   restaurantIds = result?.restaurantIds || [];
    //   restaurantsWithLocation = result?.resturantsWithLocations || [];

    //   // If aggregation returned empty results, use matched venue_ids
    //   if (!restaurantIds.length) {
    //     restaurantIds = matchedVenueIds;
    //   }
    // } else {
    //   // Original flow if no matched data is provided
    //   const result =
    //     (await filterVariantsWithAggregation({
    //       locations,
    //       radius,
    //       latitude,
    //       longitude,
    //       returnTypes: ["restaurants"],
    //     })) || [];

    //   restaurantIds = result?.restaurantIds || [];
    //   restaurantsWithLocation = result?.resturantsWithLocations || [];
    // }

    // Find venues based on the restaurantIds
    const venues = await Restaurant.find(
      {
        _id: { $in: restaurantIds },
      },
      "_id restaurantName image state district phoneNumber streetAddress active mediaUrl reviews rating url"
    );

    const venueData = await Promise.all(
      venues.map(async (venue) => {
        const foodCategories = await FoodCategory.find(
          { restaurant_id: venue._id },
          "name"
        );

        // Look for distance from restaurantsWithLocation
        const distanceObj = venues.find(
          (item) => item._id.toString() === venue._id.toString()
        );

        // Look for match data if matched is provided
        let matchData = {};
        if (matched && matched.length > 0) {
          const matchInfo = matched.find(
            (item) => item.venue_id === venue._id.toString()
          );
          if (matchInfo) {
            matchData = {
              match_percentage: matchInfo.match_percentage,
              best_variant_name: matchInfo.best_variant_name,
              best_variant_id: matchInfo.best_variant_id,
            };
          }
        }

        return {
          ...venue.toObject(),
          distance: distanceObj?.distance || null,
          foodCategories: [...new Set(foodCategories.map((fc) => fc.name))],
          ...matchData, // Add match data if it exists
        };
      })
    );

    res.status(200).json(venueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVenueByIdController = async (req, res) => {
  try {
    const venue = await getVenueById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVenueController = async (req, res) => {
  try {
    const venue = await updateVenue(req.params.id, req.body);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVenueController = async (req, res) => {
  try {
    const venue = await deleteVenue(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createVenueController,
  getVenuesController,
  getVenuesByLocation,
  getVenueByIdController,
  updateVenueController,
  deleteVenueController,
};
