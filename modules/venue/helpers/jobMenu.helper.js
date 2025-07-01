const mongoose = require("mongoose");
const Variant = require("../models/variant.model");
const Restaurant = require("../../../models/RestaurantModels");
const MasterMenu = require("../models/masterMenu.model");
const Cuisine = require("../models/cuisine.model");

const getRestaurantsFilteredByRadius = async ({
  radius,
  longitude,
  latitude,
}) => {
  // Parse the inputs to ensure they're in the correct format
  const parsedLongitude = parseFloat(longitude);
  const parsedLatitude = parseFloat(latitude);
  const parsedRadius = parseInt(radius);

  // First, get all restaurants (or apply other filters if needed)
  const allRestaurants = await Restaurant.find({});

  // Then filter the restaurants by calculating distance for each
  const restaurantsInRadius = allRestaurants.filter((restaurant) => {
    // Extract coordinates from restaurant
    let restaurantLat, restaurantLng;

    // Handle different data structures
    if (restaurant.location && restaurant.location.coordinates) {
      // GeoJSON format
      [restaurantLng, restaurantLat] = restaurant.location.coordinates;
    } else if (
      restaurant.location &&
      restaurant.location.lt &&
      restaurant.location.lg
    ) {
      // Custom format with lt/lg
      restaurantLat = restaurant.location.lt;
      restaurantLng = restaurant.location.lg;
    } else if (restaurant.lt && restaurant.lg) {
      // Direct lt/lg properties
      restaurantLat = restaurant.lt;
      restaurantLng = restaurant.lg;
    } else {
      // No valid location data found
      return false;
    }

    // Calculate distance using Haversine formula
    const distance = getDistanceFromLatLonInKm(
      parsedLatitude,
      parsedLongitude,
      restaurantLat,
      restaurantLng
    );
    // Add distance to restaurant object for potential sorting
    restaurant.distance = distance;

    // Check if this restaurant is within the radius
    return distance <= parsedRadius;
  });

  // Sort restaurants by distance (closest first)
  restaurantsInRadius.sort((a, b) => a.distance - b.distance);

  // Return an array of objects with restaurant ID and distance
  return restaurantsInRadius.map((restaurant) => ({
    _id: restaurant._id,
    distance: restaurant.distance.toFixed(2), // Round to 2 decimal places in km
  }));
};

// Haversine formula to calculate distance between two points on Earth
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
const getTopVariantMenuItemsByEventType = async ({
  eventTypeId,
  locations,
  radius,
  latitude,
  longitude,
  limit = 5,
}) => {
  try {
    const matchConditions = {
      "package.eventType": new mongoose.Types.ObjectId(eventTypeId),
    };

    const restaurantsInRadius = await filterVariantsWithAggregation({
      radius,
      longitude,
      latitude,
      locations,
      eventTypeId,
      returnTypes: ["restaurants"],
    });
    const restaurantIds = restaurantsInRadius?.restaurantIds || [];

    // Only add the filter if we found restaurants in the radius
    if (restaurantIds.length > 0) {
      matchConditions["restaurant._id"] = { $in: restaurantIds };
    } else {
      console.log(
        "No restaurants found in radius, query may return no results"
      );
      // You could return early here if you want to avoid the pipeline execution
      return { variants: [], menuItems: [] };
    }

    const result = await Variant.aggregate([
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: "$package" },
      {
        $lookup: {
          from: "restaurants",
          localField: "package.venueId",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },
      {
        $match: matchConditions,
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      {
        $group: {
          _id: null,
          variants: {
            $push: {
              availableMenuCount: "$availableMenuCount",
            },
          },
          menuItems: { $addToSet: "$menuItems" },
        },
      },
      {
        $project: {
          _id: 0,
          variants: 1,
          menuItems: {
            $reduce: {
              input: "$menuItems",
              initialValue: [],
              in: { $setUnion: ["$value", "$this"] },
            },
          },
        },
      },
    ]);

    return result.length
      ? {
          variants: result[0].variants?.map((item) => item?.availableMenuCount),
          menuItems: result[0].menuItems,
        }
      : { variants: [], menuItems: [] };
  } catch (error) {
    console.error("Error in getTopVariantMenuItemsByEventType:", error);
    return { variants: [], menuItems: [] };
  }
};

// Helper function to return empty results based on requested types
const getEmptyResults = (returnTypes) => {
  const emptyResults = {};

  returnTypes.forEach((type) => {
    emptyResults[type] = [];
  });

  return emptyResults;
};

// MongoDB Aggregation Pipeline version for advanced optimization
const filterVariantsWithAggregation = async ({
  radius,
  longitude,
  latitude,
  locations,
  eventTypeId = "",
  noEventTypeCheck = false,
  returnTypes = ["cuisines", "variantIds", "menuItems", "restaurants"],
}) => {
  try {
    let resturantsWithLocations = [];
    // eventTypeId = new mongoose.Types.ObjectId(eventTypeId);
    // Step 1: Get the match condition for restaurants
    let restaurantMatch;
    if (locations && locations.length > 1) {
      restaurantMatch = {
        $match: {
          $or: [
            { district: { $in: locations } },
            { state: { $in: locations } },
          ],
        },
      };
      const result = await Restaurant.aggregate([
        restaurantMatch,
        { $project: { _id: 1, name: 1, district: 1, state: 1 } },
      ]);
      result.restaurantIds = result.map((r) => r._id);
    } else if (
      locations &&
      locations.length === 1 &&
      (!radius || !latitude || !longitude)
    ) {
      restaurantMatch = {
        $match: {
          $or: [
            { district: { $in: locations } },
            { state: { $in: locations } },
          ],
        },
      };
      const result = await Restaurant.aggregate([
        restaurantMatch,
        { $project: { _id: 1, name: 1, district: 1, state: 1 } },
      ]);
      result.restaurantIds = result.map((r) => r._id);
    } else {
      // For geospatial queries, we'll need to use the original function
      // as it requires a more specific approach
      const result =
        (await getRestaurantsFilteredByRadius({
          radius,
          longitude,
          latitude,
        })) || [];
      const restaurants = result?.map((r) => r?._id);
      resturantsWithLocations = result;
      restaurantMatch = {
        $match: {
          _id: { $in: restaurants },
        },
      };
    }

    // Build partial result based on which return types are requested
    const result = {};
    result.resturantsWithLocations = resturantsWithLocations;
    // If only restaurants are needed
    if (returnTypes.length === 1 && returnTypes[0] === "restaurants") {
      const restaurantPipeline = [
        restaurantMatch,
        { $project: { _id: 1, name: 1, district: 1, state: 1 } },
      ];

      result.restaurants = await Restaurant.aggregate(restaurantPipeline);
      result.restaurantIds = result.restaurants.map((r) => r._id);

      return result;
    }
    // For all other cases, we need to go through the relationships
    const packagePipeline = [
      restaurantMatch,
      {
        $lookup: {
          from: "packages",
          localField: "_id",
          foreignField: "venueId",
          as: "packages",
        },
      },
      { $unwind: "$packages" },
      // ...(noEventTypeCheck
      //   ? {}
      //   : { $match: { "packages.eventType": { $in: [eventTypeId] } } }),
      {
        $lookup: {
          from: "variants",
          localField: "packages._id",
          foreignField: "packageId",
          as: "variants",
        },
      },
      { $unwind: "$variants" },
    ];

    if (returnTypes.includes("restaurants")) {
      result.restaurants = await Restaurant.aggregate([
        restaurantMatch,
        { $project: { _id: 1, name: 1, district: 1, state: 1 } },
      ]);
      result.restaurantIds = result.restaurants.map((r) => r._id);
    }

    if (returnTypes.includes("variantIds")) {
      const variantsPipeline = [
        ...packagePipeline,
        { $group: { _id: "$variants._id" } },
        { $project: { _id: 1 } },
      ];
      const variants = await Restaurant.aggregate(variantsPipeline);
      result.variantIds = variants.map((v) => v._id);
    }

    if (returnTypes.includes("menuItems") || returnTypes.includes("cuisines")) {
      const menuItemsPipeline = [
        ...packagePipeline,
        { $unwind: "$variants.menuItems" },
        {
          $lookup: {
            from: "mastermenus",
            localField: "variants.menuItems",
            foreignField: "_id",
            as: "menuItem",
          },
        },
        { $unwind: "$menuItem" },
      ];

      if (returnTypes.includes("menuItems")) {
        const menuItemResult = await Restaurant.aggregate([
          ...menuItemsPipeline,
          {
            $group: { _id: "$menuItem._id", menuItem: { $first: "$menuItem" } },
          },
          { $replaceRoot: { newRoot: "$menuItem" } },
        ]);
        result.menuItems = menuItemResult;
      }

      if (returnTypes.includes("cuisines")) {
        const cuisinesPipeline = [
          ...menuItemsPipeline,
          { $unwind: "$menuItem.cuisine" },
          {
            $lookup: {
              from: "cuisines",
              localField: "menuItem.cuisine",
              foreignField: "_id",
              as: "cuisine",
            },
          },
          { $unwind: "$cuisine" },
          {
            $group: { _id: "$cuisine._id", name: { $first: "$cuisine.name" } },
          },
          { $project: { _id: 1, name: 1 } },
        ];

        result.cuisines = await Restaurant.aggregate(cuisinesPipeline);
      }
    }

    return result;
  } catch (error) {
    console.error("Error in filterVariantsWithAggregation:", error);
    return getEmptyResults(returnTypes);
  }
};
function mergeResponses(responses, options = {}) {
  const {
    cuisineNames = [],
    vegOnly = false,
    nonAlcoholicOnly = false,
  } = options;

  // If cuisineNames is provided, always include "Other"
  const cuisineFilter =
    cuisineNames.length > 0 ? [...cuisineNames, "Other"] : [];

  // Create a map to store merged categories
  const mergedCategoriesMap = new Map();

  // Process each response
  responses.forEach((response) => {
    if (!Array.isArray(response)) return;

    // Process each category in the response
    response.forEach((category) => {
      const categoryId = category.categoryId;

      if (!mergedCategoriesMap.has(categoryId)) {
        // Initialize category if not already in the map
        mergedCategoriesMap.set(categoryId, {
          categoryId,
          name: category.name,
          total: 0,
          count: {},
          subcategoriesByCuisine: {},
          items: [],
        });
      }

      const mergedCategory = mergedCategoriesMap.get(categoryId);

      // Merge count - take maximum count for each item type
      for (const [itemType, count] of Object.entries(category.count || {})) {
        // Skip non-vegetarian if vegOnly is true
        if (vegOnly && itemType === "Non-Vegetarian") continue;
        if (nonAlcoholicOnly && itemType === "Alcoholic") continue;
        mergedCategory.count[itemType] = Math.max(
          mergedCategory.count[itemType] || 0,
          count || 0
        );
      }

      // Merge direct items
      if (Array.isArray(category.items)) {
        category.items.forEach((item) => {
          // Skip non-vegetarian items if vegOnly is true
          if (
            vegOnly &&
            item.itemTypes &&
            item.itemTypes.includes("Non-Vegetarian")
          )
            return;
          if (
            nonAlcoholicOnly &&
            item.itemTypes &&
            item.itemTypes.includes("Alcoholic")
          )
            return;
          // Check if item already exists in merged items
          const existingItemIndex = mergedCategory.items.findIndex(
            (existingItem) => existingItem.id === item.id
          );

          if (existingItemIndex === -1) {
            mergedCategory.items.push(item);
          }
        });
      }

      // Process subcategories by cuisine
      for (const [cuisineName, subcategories] of Object.entries(
        category.subcategoriesByCuisine || {}
      )) {
        // Skip if cuisineFilter is defined and this cuisine is not in the filter
        // Notice that "Other" is explicitly included in cuisineFilter above
        if (cuisineFilter.length > 0 && !cuisineFilter.includes(cuisineName)) {
          continue;
        }

        if (!mergedCategory.subcategoriesByCuisine[cuisineName]) {
          mergedCategory.subcategoriesByCuisine[cuisineName] = [];
        }

        // Process each subcategory
        subcategories.forEach((subcategory) => {
          const subcategoryId = subcategory.subcategoryId;

          // Find existing subcategory or create new one
          let mergedSubcategory = mergedCategory.subcategoriesByCuisine[
            cuisineName
          ].find((sub) => sub.subcategoryId === subcategoryId);

          if (!mergedSubcategory) {
            mergedSubcategory = {
              subcategoryId,
              name: subcategory.name,
              total: 0,
              count: {},
              maxCount: subcategory.maxCount || {}, // Preserve maxCount if it exists
              maxTotal: subcategory.maxTotal || 0, // Preserve maxTotal if it exists
              items: [],
            };
            mergedCategory.subcategoriesByCuisine[cuisineName].push(
              mergedSubcategory
            );
          }

          // Merge count - take maximum count for each item type
          for (const [itemType, count] of Object.entries(
            subcategory.count || {}
          )) {
            // Skip non-vegetarian if vegOnly is true
            if (vegOnly && itemType === "Non-Vegetarian") continue;
            if (nonAlcoholicOnly && itemType === "Alcoholic") continue;

            mergedSubcategory.count[itemType] = Math.max(
              mergedSubcategory.count[itemType] || 0,
              count || 0
            );
          }

          // Merge maxCount if it exists
          if (subcategory.maxCount) {
            for (const [itemType, count] of Object.entries(
              subcategory.maxCount
            )) {
              // Skip non-vegetarian if vegOnly is true
              if (vegOnly && itemType === "Non-Vegetarian") continue;
              if (nonAlcoholicOnly && itemType === "Alcoholic") continue;

              mergedSubcategory.maxCount[itemType] = Math.max(
                mergedSubcategory.maxCount[itemType] || 0,
                count || 0
              );
            }
          }

          // Update maxTotal if needed
          if (subcategory.maxTotal) {
            mergedSubcategory.maxTotal = Math.max(
              mergedSubcategory.maxTotal || 0,
              subcategory.maxTotal || 0
            );
          }

          // Merge items
          if (Array.isArray(subcategory.items)) {
            subcategory.items.forEach((item) => {
              // Skip non-vegetarian items if vegOnly is true
              if (
                vegOnly &&
                item.itemTypes &&
                item.itemTypes.includes("Non-Vegetarian")
              )
                return;
              if (
                nonAlcoholicOnly &&
                item.itemTypes &&
                item.itemTypes.includes("Alcoholic")
              )
                return;
              // Check if item already exists in merged items
              const existingItemIndex = mergedSubcategory.items.findIndex(
                (existingItem) => existingItem.id === item.id
              );

              if (existingItemIndex === -1) {
                mergedSubcategory.items.push(item);
              }
            });
          }
        });
      }
    });
  });

  // Calculate totals for each category and subcategory
  for (const category of mergedCategoriesMap.values()) {
    // Step 1: Filter subcategories before calculating
    const filteredSubcategoriesByCuisine = Object.fromEntries(
      Object.entries(category.subcategoriesByCuisine || {})
        .map(([cuisine, subcategories]) => {
          const filtered = subcategories.filter((subcat) => {
            // Calculate total from subcategory.count
            subcat.total = Object.values(subcat.count || {}).reduce(
              (sum, val) => sum + val,
              0
            );
            return subcat.total > 0;
          });
          return [cuisine, filtered];
        })
        .filter(([, subcategories]) => subcategories.length > 0)
    );

    // Replace with filtered version
    category.subcategoriesByCuisine = filteredSubcategoriesByCuisine;

    // Step 2: Sum subcategory totals
    const subcategoriesTotal = Object.values(filteredSubcategoriesByCuisine)
      .flat()
      .reduce((sum, subcat) => sum + subcat.total, 0);

    // Step 3: Sum direct item count from category.count
    const directCountTotal = Object.entries(category.count || {}).reduce(
      (sum, [itemType, val]) => {
        // Skip non-veg if vegOnly was used earlier
        if (vegOnly && itemType === "Non-Vegetarian") return sum;
        if (nonAlcoholicOnly && itemType === "Alcoholic") return sum;
        return sum + val;
      },
      0
    );

    // Step 4: Final category total
    category.total = directCountTotal + subcategoriesTotal;
  }

  // Filter out categories with no items and no subcategories
  const result = Array.from(mergedCategoriesMap.values()).filter((category) => {
    // Step 1: Filter out subcategories with total === 0
    const filteredSubcategoriesByCuisine = Object.fromEntries(
      Object.entries(category.subcategoriesByCuisine)
        .map(([cuisine, subcategories]) => {
          const filtered = subcategories.filter((subcat) => subcat.total > 0);
          return [cuisine, filtered];
        })
        .filter(([, filtered]) => filtered.length > 0) // Remove cuisines with no valid subcategories
    );

    // Step 2: Update category with filtered subcategories
    category.subcategoriesByCuisine = filteredSubcategoriesByCuisine;

    // Step 3: Final filter logic
    const hasSubcategories =
      Object.keys(filteredSubcategoriesByCuisine).length > 0;
    const hasDirectItems = category.items.length > 0;
    return category.total > 0 || hasSubcategories || hasDirectItems;
  });

  return result;
}
const restaurantsInLocation = async ({
  locations,
  radius,
  latitude,
  longitude,
}) => {
  try {
    let resturantsWithLocations = [];
    // Step 1: Get the match condition for restaurants
    let restaurantMatch;
    if (locations && locations.length > 1) {
      restaurantMatch = {
        $match: {
          $or: [
            { district: { $in: locations } },
            { state: { $in: locations } },
          ],
        },
      };
      const result = await Restaurant.aggregate([
        restaurantMatch,
        { $project: { _id: 1, name: 1, district: 1, state: 1 } },
      ]);
      result.restaurantIds = result.map((r) => r._id);
    } else if (
      locations &&
      locations.length === 1 &&
      (!radius || !latitude || !longitude)
    ) {
      restaurantMatch = {
        $match: {
          $or: [
            { district: { $in: locations } },
            { state: { $in: locations } },
          ],
        },
      };
      const result = await Restaurant.aggregate([
        restaurantMatch,
        { $project: { _id: 1, name: 1, district: 1, state: 1 } },
      ]);
      result.restaurantIds = result.map((r) => r._id);
    } else {
      // For geospatial queries, we'll need to use the original function
      // as it requires a more specific approach
      const result =
        (await getRestaurantsFilteredByRadius({
          radius,
          longitude,
          latitude,
        })) || [];
      const restaurants = result?.map((r) => r?._id);
      resturantsWithLocations = result;
      restaurantMatch = {
        $match: {
          _id: { $in: restaurants },
        },
      };
    }

    // Build partial result based on which return types are requested
    const result = {};
    result.resturantsWithLocations = resturantsWithLocations;
    // If only restaurants are needed
    const restaurantPipeline = [
      restaurantMatch,
      { $project: { _id: 1, name: 1, district: 1, state: 1 } },
    ];

    result.restaurants = await Restaurant.aggregate(restaurantPipeline);
    result.restaurantIds = result.restaurants.map((r) => r._id);
    return result?.restaurantIds ?? [];
  } catch (error) {
    return [];
  }
};
module.exports = {
  getTopVariantMenuItemsByEventType,
  filterVariantsWithAggregation,
  getRestaurantsFilteredByRadius,
  mergeResponses,
  restaurantsInLocation,
};
