const Variant = require("../models/variant.model");
const Restaurant = require("../../../models/RestaurantModels");
const Package = require("../models/package.model");
const Event = require("../models/events.model");
const { logger, errorLogger } = require("../../../config/logger");
const { populate } = require("../models/masterMenu.model");
const {
  filterVariantsWithAggregation,
  restaurantsInLocation,
  mergeResponses,
} = require("../helpers/jobMenu.helper");
const { default: mongoose } = require("mongoose");
const Cuisine = require("../models/cuisine.model");
const { filterOutDisabledItems } = require("../helpers/restaurantMenu.helper");

// create package:
const createVariantController = async (req, res, next) => {
  try {
    const {
      name,
      packageId,
      description,
      menuItems,
      cost,
      paidServices,
      freeServices,
      minPersons,
      maxPersons,
      isCustomized,
      availableMenuCount,
      jobSpecificId,
      isPrivate,
    } = req.body;
    const variantExist = await Variant.findOne({
      name,
      packageId,
      $expr: {
        $and: [
          {
            $eq: ["$jobSpecificId", new mongoose.Types.ObjectId(jobSpecificId)],
          },
          { $eq: [{ $type: "$jobSpecificId" }, "objectId"] },
        ],
      },
    });

    if (!variantExist) {
      const variant = new Variant({
        name,
        packageId,
        description,
        menuItems,
        cost,
        minPersons,
        maxPersons,
        isCustomized: isCustomized ? true : false,
        paidServices,
        freeServices,
        availableMenuCount,
        jobSpecificId,
        isPrivate,
      });

      const savedVariant = await variant.save();

      // Populate menuItems and services for the response
      const populatedVariant = await Variant.findById(savedVariant._id)
        .populate("menuItems")
        .populate("packageId");

      logger.info("Variant created successfully", {
        variant: populatedVariant,
      });
      return res.status(201).json({
        message: "Variant created successfully",
        success: true,
        variant: populatedVariant,
      });
    } else {
      return res.status(200).json({
        message: "Variant already exist with same name.",
        success: false,
      });
    }
  } catch (err) {
    errorLogger.error("Error creating variant", { error: err.message });
    res.status(500).json({
      error: err.message,
    });
  }
};

// get package
const getVariantsByPackageController = async (req, res, next) => {
  try {
    const { packageId } = req.query;
    // If no packageId is provided, get all variants
    const query = packageId ? { packageId } : {};

    const variants = await Variant.find(query)
      .populate("menuItems")
      // .populate("services")
      .populate("packageId");
    // .populate("freeServices")
    // .populate("paidServices");
    logger.info("Retrieved variants successfully");
    res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (err) {
    errorLogger.error("Error getting variants", { error: err.message });
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
// get package by id
const getVariantByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variant = await Variant.findById(id)
      .populate("menuItems")
      // .populate("services")
      .populate("packageId");
    // .populate("freeServices")
    // .populate("paidServices");
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, error: "Variant not found" });
    }
    logger.info("Retrieved variant by ID successfully", { variant });
    res.status(200).json(variant);
  } catch (err) {
    errorLogger.error("Error getting variant by ID", { error: err.message });
    return res.status(500).json({
      message: err.message,
    });
  }
};

// update package:
const UpdateVariantController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      packageId,
      description,
      menuItems,
      freeServices,
      paidServices,
      cost,
      minPersons,
      maxPersons,
      availableMenuCount,
    } = req.body;

    // Check if another variant exists with the same name and packageId, excluding the one being updated
    // const variantExist = await Variant.findOne({
    //   name,
    //   packageId,
    //   _id: { $ne: id }, // Exclude the variant with the current id
    // });

    // if (!variantExist) {
      const variant = await Variant.findByIdAndUpdate(
        id,
        {
          name,
          packageId,
          description,
          menuItems,
          freeServices,
          paidServices,
          cost,
          minPersons,
          maxPersons,
          availableMenuCount,
        },
        { new: true, runValidators: true }
      )
        .populate("menuItems")
        // .populate("services")
        .populate("packageId");
      // .populate("freeServices")
      // .populate("paidServices");

      if (!variant) {
        return res
          .status(404)
          .json({ success: false, error: "Variant not found" });
      }

      logger.info("Variant updated successfully", { variant });
      return res.status(200).json({
        message: "Variant updated successfully",
        success: true,
        variant: variant,
      });
    // } else {
    //   return res.status(200).json({
    //     message: "Variant already exists with the same name and packageId.",
    //     success: false,
    //   });
    // }
  } catch (err) {
    errorLogger.error("Error updating variant", { error: err.message });
    return res.status(500).json({
      message: err.message,
    });
  }
};

// delete package:
const deleteVariantController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Variant.findByIdAndDelete(id);
    if (!data) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }
    return res.status(200).json({
      message: "Variant deleted successfully",
    });
  } catch (err) {
    errorLogger.error("Error deleting variant", { error: err.message });
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Bulk create variants
const createBulkVariantsController = async (req, res, next) => {
  try {
    const variants = req.body; // Array of variant objects

    if (!Array.isArray(variants)) {
      return res.status(400).json({
        message: "Input should be an array of variants",
        success: false,
      });
    }

    // Check for duplicate names within the same packageId
    const duplicates = [];
    for (const variant of variants) {
      const variantExist = await Variant.findOne({
        name: variant.name,
        packageId: variant.packageId,
      });
      if (variantExist) {
        duplicates.push(variant.name);
      }
    }

    if (duplicates.length > 0) {
      return res.status(200).json({
        message: `Variants already exist with names: ${duplicates.join(", ")}`,
        success: false,
      });
    }

    // Create all variants
    const savedVariants = await Variant.insertMany(variants);

    // Fetch populated variants
    const populatedVariants = await Variant.find({
      _id: { $in: savedVariants.map((v) => v._id) },
    })
      .populate("menuItems")
      // .populate("services")
      .populate("packageId");
    // .populate("freeServices")
    // .populate("paidServices");

    logger.info("Bulk variants created successfully", {
      count: populatedVariants.length,
    });
    return res.status(201).json({
      message: "Variants created successfully",
      success: true,
      variants: populatedVariants,
    });
  } catch (err) {
    errorLogger.error("Error creating bulk variants", { error: err.message });
    res.status(500).json({
      error: err.message,
    });
  }
};

const enrichVariantsWithVenueId = async (variants) => {
  // 1. Extract unique packageIds
  const packageIds = [...new Set(variants.map((v) => v.packageId))];

  // 2. Fetch packages and map them by _id
  const packages = await Package.find(
    { _id: { $in: packageIds } },
    "_id venueId"
  );

  const packageMap = {};
  packages.forEach((pkg) => {
    packageMap[pkg._id.toString()] = pkg.venueId;
  });

  // 3. Add venueId to each variant
  const enrichedVariants = variants.map((variant) => {
    const venueId = packageMap[variant.packageId?.toString()];
    const plain = variant.toObject ? variant.toObject() : variant;

    return {
      ...plain,
      venueId: venueId || null,
    };
  });

  return enrichedVariants;
};
const filterOutDisabledFromVariants = async (variants) => {
  return variants?.map((variant) => {
    const variantMenuOffered = variant?.availableMenuCount || [];
    return {
      ...variant,
      availableMenuCount: filterOutDisabledItems(variantMenuOffered),
    };
  });
};

const filterVariantsController = async (req, res, next) => {
  try {
    let {
      locations,
      radius,
      latitude,
      longitude,
      minPerson,
      maxPerson,
      minBudget,
      maxBudget,
      eventTypeId,
      personRangeMatchType = "loose",
      budgetRangeMatchType = "loose",
      cuisineMatchThreshold = 0.6,
      cuisineIds = [],
      strictLocationCheck = true,
      variantsAndServicesOnly = false,
      vegOnly = false,
      nonAlcoholicOnly = false,
    } = req.body;

    minPerson = parseInt(minPerson || 0);
    maxPerson = parseInt(maxPerson || 0);
    minBudget = parseInt(minBudget || 0);
    maxBudget = parseInt(maxBudget || 0);

    if (!minPerson || !maxPerson || !minBudget || !maxBudget) {
      return res
        .status(200)
        .json({ variants: [], allServices: [], venues: [] });
    }

    //query for peopleRange
    let personQuery = {};
    if (personRangeMatchType === "strict") {
      personQuery = {
        minPersons: { $lte: minPerson },
        maxPersons: { $gte: maxPerson },
      };
    } else if (personRangeMatchType === "exact") {
      personQuery = {
        minPersons: { $gte: minPerson },
        maxPersons: { $lte: maxPerson },
      };
    } else {
      // loose match (any overlap)
      personQuery = {
        minPersons: { $lte: maxPerson },
        maxPersons: { $gte: minPerson },
      };
    }

    // Function to filter variants by budget range
    function filterVariantsByBudget(variants) {
      if (minBudget === 0 && maxBudget === Infinity) {
        return variants; // No budget filtering needed
      }

      return variants.filter((variant) => {
        const minCost = variant.cost;
        const maxCost = variant.cost;

        if (budgetRangeMatchType === "strict") {
          // Variant's cost range must be completely within the budget range
          return minCost >= minBudget && maxCost <= maxBudget;
        } else if (budgetRangeMatchType === "exact") {
          // Variant's cost range must exactly match the budget range
          return minCost === minBudget && maxCost === maxBudget;
        } else {
          // loose match (any overlap)
          return maxCost >= minBudget && minCost <= maxBudget;
        }
      });
    }

    const cuisineIdSet = new Set(cuisineIds.map((c) => c.toString()));
    function filterVariantsByCuisineMatch(variants) {
      return cuisineIds.length > 0
        ? variants.filter((variant) => {
            const menuItems = variant.menuItems || [];
            const matchedCount = menuItems.filter((item) => {
              const cuisines = item.cuisine || [];
              return cuisines.some((c) => cuisineIdSet.has(c.toString()));
            }).length;

            const matchRatio =
              menuItems.length > 0 ? matchedCount / menuItems.length : 0;
            return matchRatio >= cuisineMatchThreshold;
          })
        : variants;
    }

    let restaurantIds = [];
    if (locations?.length > 0) {
      restaurantIds =
        (await restaurantsInLocation({
          locations,
          radius,
          latitude,
          longitude,
        })) || [];
    }

    // console.log(restaurantIds);

    let variants = [];
    let customizeText;

    if (restaurantIds.length > 0) {
      const packages = await Package.find({
        venueId: { $in: restaurantIds },
        ...(eventTypeId && { eventType: { $in: [eventTypeId] } }),
      });
      if (packages.length > 0) {
        const packageIds = packages.map((pkg) => pkg._id);
        variants = await Variant.find({
          isCustomized: false,
          $or: [{ jobSpecificId: null }, { jobSpecificId: { $exists: false } }],
          packageId: { $in: packageIds },
          ...personQuery,
          // Removed the cost filter from database query since we'll filter in memory
        })
          .populate({
            path: "menuItems",
            populate: [
              {
                path: "category",
                populate: { path: "parentCategories" },
              },
              { path: "itemTypes" },
            ],
          })
          .sort({ cost: 1 });
        // console.log(variants.length);
        variants = filterVariantsByCuisineMatch(variants);
        variants = filterVariantsByBudget(variants);
      }
    }

    if (!strictLocationCheck && variants.length === 0) {
      const packages = await Package.find({
        ...(eventTypeId && { eventType: { $in: [eventTypeId] } }),
      });
      if (packages.length > 0) {
        const packageIds = packages.map((pkg) => pkg._id);
        variants = await Variant.find({
          isCustomized: false,
          $or: [{ jobSpecificId: null }, { jobSpecificId: { $exists: false } }],
          packageId: { $in: packageIds },
          ...personQuery,
          // Removed the cost filter from database query since we'll filter in memory
        })
          .populate({
            path: "menuItems",
            populate: [
              {
                path: "category",
                populate: { path: "parentCategories" },
              },
              { path: "itemTypes" },
            ],
          })
          .sort({ cost: 1 });
        variants = filterVariantsByCuisineMatch(variants);
        variants = filterVariantsByBudget(variants);
      }
    }

    // If still no variants found, default response return kr do
    if (variants.length === 0) {
      // console.log("No variants found after all attempts");
      return res
        .status(200)
        .json({ variants: [], allServices: [], venues: [] });
    }
    if (vegOnly) {
      variants = variants.filter((variant) =>
        variant?.menuItems?.every(
          (item) =>
            !item?.itemTypes?.some((type) => type?.name === "Non-Vegetarian")
        )
      );
    }
    if (nonAlcoholicOnly) {
      variants = variants.filter((variant) =>
        variant?.menuItems?.every(
          (item) => !item?.itemTypes?.some((type) => type?.name === "Alcoholic")
        )
      );
    }
    const allServices = [
      ...variants.flatMap((variant) =>
        (variant.freeServices || []).map((service) => ({
          ...service,
          price: 0, // normalize "free" to 0
        }))
      ),
      ...variants.flatMap((variant) =>
        (variant.paidServices || []).map((service) => ({
          ...service,
          price:
            service?.Price === "free" || !service?.Price
              ? 0
              : Number(service.Price) || 0,
        }))
      ),
    ];

    // Group by serviceName + Variant + VariantType
    const grouped = {};

    allServices.forEach((item) => {
      // Capitalize Variant and assign to serviceName
      item.serviceName =
        item.Variant.charAt(0).toUpperCase() + item.Variant.slice(1);

      // Create a unique key using only the necessary fields
      // Changed to use either VariantType or a default value if it's undefined
      const key = `${item.serviceName}|${item.VariantType || "default"}|${
        item.price === "free" || item.price === 0 ? "free" : "paid"
      }`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const result = Object.values(grouped).map((groupItems) => {
      // Filter for valid numeric prices
      const numericPrices = groupItems
        .filter((i) => typeof i.price === "number" && i.price > 0)
        .map((i) => i.price);

      // Check if all items are free
      const allFree = groupItems.every(
        (i) => i.price === "free" || i.price === 0
      );

      let minPrice = 0;
      let maxPrice = 0;

      if (allFree) {
        minPrice = 0;
        maxPrice = 0;
      } else if (numericPrices.length > 0) {
        minPrice = Math.min(...numericPrices);
        maxPrice = Math.max(...numericPrices);
      }

      // Create the result object from the first item in the group
      const sample = { ...groupItems[0] };

      // Add price information
      sample.minPrice = minPrice;
      sample.maxPrice = maxPrice;
      sample.priceRange =
        minPrice === maxPrice ? `${minPrice}` : `${minPrice}-${maxPrice}`;

      return sample;
    });
    variants = await enrichVariantsWithVenueId(variants);
    variants = await filterOutDisabledFromVariants(variants);
    const venueIds = variants?.map((variant) => variant?.venueId) || [];
    const venueIdsSet = new Set(venueIds);
    const venues = await Restaurant.find({
      _id: { $in: Array.from(venueIdsSet) },
    })
      .lean()
      .select("restaurantName");

    return res.status(200).json({
      variants: variants || [],
      allServices: result || [],
      venues: venues || [],
    });
  } catch (err) {
    console.error("Error in filterVariantsController:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
const variantByIds = async (req, res, next) => {
  try {
    const { variantIds } = req.body;
    let variants = [];
    variants = await Variant.find({ _id: { $in: variantIds } });
    if (!variants || variants.length === 0) {
      return res.status(200).json([]);
    }
    variants = await enrichVariantsWithVenueId(variants);
    variants = await filterOutDisabledFromVariants(variants);
    return res.status(200).json(variants);
  } catch (err) {
    console.error("Error in variantByIds:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

const newFilteredVariantsController = async (req, res, next) => {
  const startTime = Date.now();
  try {
    let {
      locations,
      radius,
      latitude,
      longitude,
      minPerson,
      maxPerson,
      minBudget,
      maxBudget,
      eventTypeId,
      personRangeMatchType = "loose",
      budgetRangeMatchType = "loose",
      cuisineMatchThreshold = 0.6,
      cuisineIds = [],
      strictLocationCheck = true,
      variantsAndServicesOnly = false,
      vegOnly = false,
      nonAlcoholicOnly = false,
    } = req.body;

    minPerson = parseInt(minPerson || 0);
    maxPerson = parseInt(maxPerson) || Infinity;
    minBudget = parseInt(minBudget || 0);
    maxBudget = parseInt(maxBudget) || Infinity;

    // Build person query
    let personQuery = {};
    if (personRangeMatchType === "strict") {
      personQuery = {
        minPersons: { $lte: minPerson },
        maxPersons: { $gte: maxPerson },
      };
    } else if (personRangeMatchType === "exact") {
      personQuery = {
        minPersons: { $gte: minPerson },
        maxPersons: { $lte: maxPerson },
      };
    } else {
      personQuery = {
        minPersons: { $lte: maxPerson },
        maxPersons: { $gte: minPerson },
      };
    }

    // Build cost filter
    let costFilter = {};
    if (minBudget != null && maxBudget != null) {
      if (budgetRangeMatchType === "strict") {
        costFilter = {
          cost: { $gte: minBudget, $lte: maxBudget },
        };
      } else if (budgetRangeMatchType === "exact") {
        costFilter = {
          cost: { $eq: (minBudget + maxBudget) / 2 },
        };
      } else {
        costFilter = {
          cost: { $lte: maxBudget, $gte: minBudget },
        };
      }
    } else if (minBudget != null) {
      costFilter = { cost: { $gte: minBudget } };
    } else if (maxBudget != null) {
      costFilter = { cost: { $lte: maxBudget } };
    }

    // Get restaurant IDs based on location
    let restaurantIds = [];
    if (locations?.length > 0) {
      restaurantIds =
        (await restaurantsInLocation({
          locations,
          radius,
          latitude,
          longitude,
        })) || [];
    }

    // Build the main aggregation pipeline
    const matchStage = {
      isCustomized: false,
      $or: [{ jobSpecificId: null }, { jobSpecificId: { $exists: false } }],
      ...personQuery,
      ...(Object.keys(costFilter).length > 0 && costFilter),
    };

    if (restaurantIds.length > 0) {
      const packages = await Package.find({
        venueId: { $in: restaurantIds },
        ...(eventTypeId && { eventType: { $in: [eventTypeId] } }),
      }).lean();

      if (packages.length > 0) {
        matchStage.packageId = { $in: packages.map((pkg) => pkg._id) };
      } else if (strictLocationCheck) {
        return res.status(200).json({
          variants: [],
          allServices: [],
          venues: [],
          initialMenuSection: [],
        });
      }
    } else if (eventTypeId) {
      const packages = await Package.find({
        eventType: { $in: [eventTypeId] },
      }).lean();

      if (packages.length > 0) {
        matchStage.packageId = { $in: packages.map((pkg) => pkg._id) };
      }
    }

    // Main aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "menuitems",
          localField: "menuItems",
          foreignField: "_id",
          as: "menuItems",
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "menuItems.category",
          foreignField: "_id",
          as: "menuItemCategories",
        },
      },
      {
        $lookup: {
          from: "itemtypes",
          localField: "menuItems.itemTypes",
          foreignField: "_id",
          as: "itemTypes",
        },
      },
    ];

    // Add cuisine filtering if needed
    if (cuisineIds.length > 0) {
      const cuisineObjectIds = cuisineIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      pipeline.push({
        $match: {
          "menuItems.cuisine": { $in: cuisineObjectIds },
        },
      });
    }

    // Execute aggregation
    let variants = await Variant.aggregate(pipeline).sort({ cost: 1 });

    // Early return if no variants
    if (!variants.length) {
      return res.status(200).json({
        variants: [],
        allServices: [],
        venues: [],
        initialMenuSection: [],
      });
    }

    // Apply veg/non-alcoholic filters in memory since they're complex
    if (vegOnly) {
      variants = variants.filter((variant) =>
        variant.menuItems.every(
          (item) =>
            !variant.itemTypes.some(
              (type) =>
                type.name === "Non-Vegetarian" &&
                item.itemTypes
                  .map((t) => t.toString())
                  .includes(type._id.toString())
            )
        )
      );
    }

    if (nonAlcoholicOnly) {
      variants = variants.filter((variant) =>
        variant.menuItems.every(
          (item) =>
            !variant.itemTypes.some(
              (type) =>
                type.name === "Alcoholic" &&
                item.itemTypes
                  .map((t) => t.toString())
                  .includes(type._id.toString())
            )
        )
      );
    }

    // Process services
    const allServices = [
      ...variants.flatMap((variant) =>
        (variant.freeServices || []).map((service) => ({
          ...service,
          price: 0,
        }))
      ),
      ...variants.flatMap((variant) =>
        (variant.paidServices || []).map((service) => ({
          ...service,
          price:
            service?.Price === "free" || !service?.Price
              ? 0
              : Number(service.Price) || 0,
        }))
      ),
    ];

    // Group services efficiently
    const grouped = allServices.reduce((acc, item) => {
      const serviceName =
        item.Variant.charAt(0).toUpperCase() + item.Variant.slice(1);
      const key = `${serviceName}|${item.VariantType || "default"}|${
        item.price === "free" || item.price === 0 ? "free" : "paid"
      }`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const result = Object.values(grouped).map((groupItems) => {
      const numericPrices = groupItems
        .filter((i) => typeof i.price === "number" && i.price > 0)
        .map((i) => i.price);

      const allFree = groupItems.every(
        (i) => i.price === "free" || i.price === 0
      );
      const minPrice = allFree
        ? 0
        : numericPrices.length
        ? Math.min(...numericPrices)
        : 0;
      const maxPrice = allFree
        ? 0
        : numericPrices.length
        ? Math.max(...numericPrices)
        : 0;

      return {
        ...groupItems[0],
        minPrice,
        maxPrice,
        priceRange:
          minPrice === maxPrice ? `${minPrice}` : `${minPrice}-${maxPrice}`,
      };
    });

    // Get venue information
    const venueIds = [
      ...new Set(variants.map((v) => v.package?.venueId).filter(Boolean)),
    ];
    const [venues] = await Promise.all([
      Restaurant.find({ _id: { $in: venueIds } })
        .lean()
        .select("restaurantName"),
      // Cuisine.find({
      //   _id: {
      //     $in: [...new Set(variants.flatMap(v =>
      //       v.menuItems.flatMap(i => i.cuisine || [])
      //     ))]
      //   }
      // }).lean()
    ]);

    // const menuCount = variants.map(v => v.availableMenuCount);
    // const cuisineNames = cuisines.map(c => c.name);

    // const initialMenuSection = mergeResponses(menuCount, {
    //   cuisineNames: [...cuisineNames, "Other"],
    //   vegOnly,
    //   nonAlcoholicOnly,
    // });

    // Log timing before returning response
    const endTime = Date.now();
    logger.info(
      `newFilteredVariantsController completed in ${endTime - startTime}ms`
    );

    return res.status(200).json({
      variants,
      allServices: result,
      venues,
      // initialMenuSection,
    });
  } catch (err) {
    const endTime = Date.now();
    errorLogger.error(
      `Error in newFilteredVariantsController (${endTime - startTime}ms):`,
      err
    );
    return res.status(500).json({ message: err.message });
  }
};
module.exports = {
  createVariantController,
  getVariantsByPackageController,
  getVariantByIdController,
  UpdateVariantController,
  deleteVariantController,
  createBulkVariantsController,
  filterVariantsController,
  variantByIds,
  newFilteredVariantsController,
};
