const Restaurant = require("../models/RestaurantModels");
const FoodCategory = require("../models/FoodCategory");
const FoodItemsAddOn = require("../models/FoodItemsAddOn");
const FoodItems = require("../models/FoodItems");
const Order = require("../models/OrderModel");
const { logger, errorLogger } = require("../config/logger");
const { default: mongoose } = require("mongoose");
const FoodSubCategory = require("../models/FoodSubCategory");
const QRCode = require("../models/QRCode");
const Business = require("../models/BusinessModel");
const adminUser = require("../models/Admin");
const { STATUS_ENUM } = require("../constants");
const Counter = require("../models/Counter");
const schedulerService = require('../modules/jobSheduler/services/scheduler.service');

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  const { email } = req.body;
  const existingRestaurant = await Restaurant.findOne({ email });
  if (existingRestaurant) {
    return res.status(400).json({
      success: false,
      error: "Restaurant with this email already exists",
    });
  }
  try {
    const restaurant = await Restaurant.create(req.body);
    logger.info("Restaurant created successfully", { restaurant });
    res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    errorLogger.error("Error creating restaurant", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Start of today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // End of today

    const data = await Restaurant.aggregate([
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "businessId",
          as: "businessData",
        },
      },
      {
        $lookup: {
          from: "restaurants", // Assuming branches are stored in the same 'restaurants' collection
          localField: "businessData.branches",
          foreignField: "_id",
          as: "branches",
        },
      },
      {
        $lookup: {
          from: "orders",
          let: {
            restaurantId: { $toString: "$_id" }, // Convert restaurant _id to string
            branchIds: {
              $map: {
                input: "$branches._id",
                as: "id",
                in: { $toString: "$$id" },
              },
            }, // Convert branch _ids to strings
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$restaurant_id", "$$restaurantId"] },
                    { $in: ["$restaurant_id", "$$branchIds"] },
                  ],
                },
                createdAt: { $gte: todayStart, $lte: todayEnd },
                payment: { $exists: true },
                orderStatus: {
                  $in: [
                    STATUS_ENUM.InProcess,
                    STATUS_ENUM.ready,
                    STATUS_ENUM.delivered,
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$restaurant_id",
                totalOrders: { $sum: 1 },
                totalCustomers: { $addToSet: "$user_id" },
              },
            },
            {
              $project: {
                _id: 1,
                totalOrders: 1,
                totalCustomers: { $size: "$totalCustomers" },
              },
            },
          ],
          as: "revenueData",
        },
      },
      {
        $addFields: {
          revenue: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$revenueData",
                  as: "revenue",
                  cond: { $eq: ["$$revenue._id", { $toString: "$_id" }] }, // Match restaurant revenue by string-converted _id
                },
              },
              0,
            ],
          },
          branches: {
            $map: {
              input: "$branches",
              as: "branch",
              in: {
                $mergeObjects: [
                  "$$branch",
                  {
                    revenue: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$revenueData",
                            as: "revenue",
                            cond: {
                              $eq: [
                                "$$revenue._id",
                                { $toString: "$$branch._id" },
                              ],
                            }, // Match branch revenue by string-converted _id
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          businessData: 0,
          revenueData: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    logger.info("Retrieved all restaurants successfully");
    res.status(200).json({ success: true, data });
  } catch (err) {
    errorLogger.error("Error getting all restaurants", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getMediaFilesByRestaurantId = async (req, res) => {
try{
       const restaurantId = req.params.id;
       const restaurant = await Restaurant.findById(restaurantId);
       if(restaurant)
       {
        console.log(restaurant);
       res.status(200).json(restaurant.mediaUrl)
       }
} catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// Get multiple restaurants by IDs
exports.getRestaurantsByIds = async (req, res) => {
  try {
    // Extract restaurant IDs from the request body
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid array of restaurant IDs",
      });
    }

    // Fetch the restaurants matching the provided IDs and include only specific fields
    const restaurants = await Restaurant.find(
      { _id: { $in: ids } },
      "_id restaurantName state district streetAddress active"
    );

    // Check if any restaurants were found
    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No restaurants found for the given IDs",
      });
    }

    logger.info("Retrieved restaurants by IDs successfully", { ids });
    res.status(200).json({ success: true, data: restaurants });
  } catch (err) {
    errorLogger.error("Error getting restaurants by IDs", {
      error: err.message,
    });
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    // Find the restaurant by ID
    const restaurant = await Restaurant.findById(req.params.id);

    // If restaurant not found, return 404 error
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
    }
    // Find the Business document where the restaurant is part of branches
    const business = await Business.findOne({ businessId: restaurant?._id });
    // If no associated business is found, return the restaurant without branches
    const branchesIds = business ? business.branches || [] : [];

    logger.info("Retrieved restaurant by ID successfully", { restaurant });
    res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(), // Convert restaurant document to plain object
        branches: branchesIds, // Only return branch IDs from the Business document
      },
    });
  } catch (err) {
    errorLogger.error("Error getting restaurant by ID", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};
// Get a single restaurant by ID
exports.getRestaurantByUrl = async (req, res) => {
  try {
    const url = `/restaurant/${req.params.url}`;
    console.log(url);
    const restaurant = await Restaurant.findOne({ url });
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
    }
    logger.info("Retrieved restaurant by url successfully", { restaurant });
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    errorLogger.error("Error getting restaurant by url", {
      error: err.message,
    });
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a restaurant by ID
exports.updateRestaurant = async (req, res) => {
  try {
    const { updateQr, qrCodes } = req.body;
    const restaurantId = req.params.id;
    let restaurant;

    // Check if auto-apply settings are being updated
    if (req.body.autoApplySettings) {
      // Store the settings to pass to scheduler after successful update
      const autoApplySettings = req.body.autoApplySettings;
      logger.info('Auto-apply settings update detected:', autoApplySettings);
    }

    if (updateQr) {
      if (qrCodes.deleteQr || qrCodes.groupDelete) {
        const qrCodeObjectId = qrCodes._id
          ? new mongoose.Types.ObjectId(qrCodes._id)
          : null;

        // Perform the update operation
        const updatedOrder = await Restaurant.updateOne(
          { _id: new mongoose.Types.ObjectId(restaurantId) }, // Ensure restaurant ID is an ObjectId
          {
            $pull: {
              qrCodes: qrCodes.groupDelete
                ? { group: qrCodes.group } // Pull by group if groupDelete is true
                : { _id: qrCodeObjectId }, // Pull by specific ObjectId
            },
          }
        );

        if (updatedOrder.modifiedCount > 0) {
          console.log("QR Code removed successfully.");
        } else {
          console.log("QR Code not found or already removed.", {
            qrCodes: qrCodes.groupDelete
              ? { group: qrCodes.group }
              : { _id: new mongoose.Types.ObjectId(qrCodes._id) },
          });
        }
      } else if (qrCodes?._id) {
        if (qrCodes.name) {
          const oldData = await Restaurant.findById(restaurantId);
          const oldTable = oldData.qrCodes.filter((item) =>
            item._id.equals(qrCodes._id)
          );
          if (oldTable && oldTable.length && oldTable[0].name)
            await Order.updateMany(
              { restaurant_id: restaurantId, tableName: oldTable[0].name },
              {
                $set: {
                  tableName: qrCodes.name,
                },
              }
            );
        }
        await Restaurant.updateOne(
          {
            _id: req.params.id,
            "qrCodes._id": qrCodes._id,
          },
          {
            $set: {
              "qrCodes.$.name": qrCodes.name,
              "qrCodes.$.group": qrCodes.group,
              "qrCodes.$.orderType": qrCodes.orderType,
            },
          }
        );
      } else {
        const newQrCode = {
          _id: new mongoose.Types.ObjectId(),
          ...qrCodes,
        };

        await Restaurant.updateOne(
          { _id: req.params.id },
          {
            $push: { qrCodes: newQrCode },
          }
        );
      }
      restaurant = await Restaurant.findOne({ _id: req.params.id });
    } else {
      restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      const business = await Business.findOne({ businessId: restaurant._id })
        .populate({
          path: "branches",
          model: "Restaurant",
        })
        .lean();
      const branches = business ? business.branches || [] : [];
      restaurant.branches = branches;
    }

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
    }

    // If auto-apply settings were updated, manage the scheduler task
    if (req.body.autoApplySettings) {
      try {
        await schedulerService.manageAutoApplyTask(restaurantId, req.body.autoApplySettings);
        logger.info('Auto-apply scheduler task updated successfully');
      } catch (error) {
        logger.error('Error managing auto-apply scheduler task:', error);
        // Don't return error here, as the restaurant update was successful
      }
    }

    logger.info("Restaurant updated successfully", { restaurant });
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    errorLogger.error("Error updating restaurant", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateRestaurantWithMediaUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, type = 'image' } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: "Media URL is required" });
    }
    console.log(id)
    const restaurant = await Restaurant.findById(id);
    console.log(restaurant)
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    // Push the new media URL to the mediaUrl array
    restaurant.mediaUrl.push({
      url,
      type,
      uploadedAt: new Date(),
    });

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Media URL added successfully",
      data: restaurant.mediaUrl,
    });

  } catch (err) {
    errorLogger.error("Error updating restaurant", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.updateRestaurantWithBannerUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, type = 'image' } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: "Banner URL is required" });
    }
    console.log(id)
    const restaurant = await Restaurant.findById(id);
    console.log(restaurant)
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    // Push the new media URL to the mediaUrl array
    restaurant.bannerUrl = {
      url,
      type,
      uploadedAt: new Date(),
    };

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Banner URL added successfully",
      data: restaurant.bannerUrl,
    });

  } catch (err) {
    errorLogger.error("Error updating restaurant", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.updateAboutDetails = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { aboutDetails } = req.body;
    console.log(req.body)
    const updatedFields = {
      description: aboutDetails.description,
      streetAddress: aboutDetails.address?.street,
      district: aboutDetails.address?.city,
      state: aboutDetails.address?.state,
      phoneNumber: aboutDetails.phone,
      email: aboutDetails.email,
      active: aboutDetails.status,
    };
    console.log(updatedFields)
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updatedFields,
      { new: true }
    );
    console.log(updatedRestaurant)
    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({ message: 'Restaurant details updated', data: updatedRestaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Delete a restaurant by ID with transaction
exports.deleteRestaurant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and delete the restaurant
    const deletedRestaurant = await Restaurant.findByIdAndDelete(
      req.params.id
    ).session(session);
    if (!deletedRestaurant) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
    }

    // Delete related data in proper order
    const categoryIds = await FoodCategory.find({
      restaurant_id: deletedRestaurant._id,
    })
      .session(session)
      .distinct("_id");

    await Promise.all([
      // Delete related FoodSubCategories where category_id is in the deleted FoodCategory's _id
      FoodSubCategory.deleteMany({
        category_id: { $in: categoryIds },
      }).session(session),

      // Delete FoodCategories related to the restaurant
      FoodCategory.deleteMany({ restaurant_id: deletedRestaurant._id }).session(
        session
      ),

      // Delete FoodItems related to the restaurant
      FoodItems.deleteMany({ restaurant_id: deletedRestaurant._id }).session(
        session
      ),

      // Delete FoodItemsAddOn related to the restaurant
      FoodItemsAddOn.deleteMany({
        restaurant_id: deletedRestaurant._id,
      }).session(session),
    ]);

    // Remove the deleted restaurant ID from other restaurants' branches
    await Business.updateMany(
      { branches: deletedRestaurant._id }, // Check where the deleted restaurant is in branches
      { $pull: { branches: deletedRestaurant._id } } // Remove it from the branches array
    ).session(session);

    await session.commitTransaction();
    session.endSession();

    logger.info("Restaurant deleted successfully", { deletedRestaurant });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    errorLogger.error("Error deleting restaurant", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

async function createRestaurantSuperAdmin(data, session) {
  const restaurant = await Restaurant.create([data], { session });
  return restaurant[0]?._id;
}

function getFinalData(values) {
  return {
    name: values.name,
    description: values.description,
    basePrice: values.quantity[0].price,
    quantityAddOn: values.quantity,
    miscellaneous: [],
    foodType: values.foodType,
    tags: [],
    restaurant_id: values.restaurant_id,
    category: values.category,
    AddOnData: [],
    isResFav: false,
  };
}

async function createCategoryWithItems(category, restaurantId, session) {
  const newCategory = await FoodCategory.create(
    [{ ...category, subCategory: [], restaurant_id: restaurantId }],
    { session }
  );
  if (category?.subCategory?.length > 0) {
    for (const subCategory of category.subCategory) {
      const newSubCategory = await FoodSubCategory.create(
        [{ ...subCategory, category_id: newCategory[0]._id }],
        { session }
      );
      await FoodCategory.findByIdAndUpdate(
        newCategory[0]?._id,
        { $push: { subCategory: newSubCategory[0] } },
        { session }
      );

      if (subCategory?.menuItems?.length > 0) {
        const menuItems = subCategory?.menuItems?.map((menuItem) =>
          getFinalData({
            ...menuItem,
            restaurant_id: restaurantId,
            category: newSubCategory[0],
          })
        );
        await FoodItems.insertMany(menuItems, { session });
      }
    }
  }

  if (category?.menuItems?.length > 0) {
    const menuItems = category.menuItems.map((menuItem) =>
      getFinalData({
        ...menuItem,
        restaurant_id: restaurantId,
        category: newCategory[0],
      })
    );
    await FoodItems.insertMany(menuItems, { session });
  }
}

exports.createSubBranches = async (req, res) => {
  const { mainBranch, subBranches, categories } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const mainBranchId = await createRestaurantSuperAdmin(mainBranch, session);
    const subBranchesId = [];

    for (const subBranch of subBranches) {
      const subBranchId = await createRestaurantSuperAdmin(subBranch, session);
      subBranchesId.push(subBranchId);
    }

    for (const category of categories) {
      await createCategoryWithItems(category, mainBranchId, session);
    }

    for (const subBranchId of subBranchesId) {
      for (const category of categories) {
        await createCategoryWithItems(category, subBranchId, session);
      }
    }
    // await Restaurant.findByIdAndUpdate(
    //   mainBranchId,
    //   { $push: { branches: { $each: subBranchesId } } },
    //   { session }
    // );
    const mainRestaurant = await Restaurant.findOne({
      _id: mainBranchId,
    }).session(session);

    const business = new Business({
      businessId: mainRestaurant?._id,
      businessName: mainRestaurant.restaurantName,
      address: {
        state: mainRestaurant.state,
        district: mainRestaurant.district,
        streetAddress: mainRestaurant.streetAddress,
      },
      image: mainRestaurant.image,
      contactNumber: mainRestaurant.phoneNumber,
      email: mainRestaurant.email,
      branches: [...subBranchesId],
    });

    await business.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Success",
      mainBranchId,
      subBranchesId,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating sub-branches:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
async function fixDuplicateUrls() {
  try {
    // Initialize the counter if it doesn't exist
    let counter = await Counter.findOne({ name: "restaurantUrl" });
    if (!counter) {
      counter = await Counter.create({ name: "restaurantUrl", seq: 10000 });
    }

    // Fetch all restaurants that do not have a URL
    const restaurantsWithoutUrl = await Restaurant.find({
      url: { $exists: true },
    });

    for (const restaurant of restaurantsWithoutUrl) {
      const restaurantWords = restaurant.restaurantName
        .toLowerCase()
        .split(/\s+/);
      const baseUrl = `/restaurant/${restaurantWords.join("-")}`;

      // Generate the next unique suffix using the counter
      counter = await Counter.findOneAndUpdate(
        { name: "restaurantUrl" },
        { $inc: { seq: 1 } },
        { new: true }
      );

      const nextSuffix = counter.seq;

      // Assign the unique URL
      const generatedUrl = `${baseUrl}-${nextSuffix}`;
      restaurant.url = generatedUrl;

      // Save the updated restaurant
      await restaurant.save();
    }
    console.log(" URLs updated");

    // res.status(200).json({
    //   message: "URLs updated successfully for restaurants without a URL.",
    //   updatedCount: restaurantsWithoutUrl.length,
    // });
  } catch (error) {
    console.error("Error updating restaurant URLs:", error);
    // res.status(500).json({
    //   message: "An error occurred while updating restaurant URLs.",
    //   error: error.message,
    // });
  }
}

// fixDuplicateUrls();

exports.addSubBranchToMainBranch = async (req, res) => {
  const { mainBranchId, subBranchData } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Verify Main Branch Exists
    const mainBranch = await Restaurant.findById(mainBranchId).session(session);
    if (!mainBranch) {
      return res
        .status(404)
        .json({ success: false, error: "Main branch not found" });
    }

    // Step 2: Fetch Main Branch Categories, Subcategories, and Food Items
    const categoriesOfMainBranch = await FoodCategory.find({
      restaurant_id: mainBranchId,
    }).session(session);

    const subCategoriesOfMainBranch = await FoodSubCategory.find({
      category_id: { $in: categoriesOfMainBranch.map((c) => c._id) },
    }).session(session);

    const foodItemsOfMainBranch = await FoodItems.find({
      restaurant_id: mainBranchId,
    }).session(session);

    // Step 3: Create Sub-Branch
    const newSubBranch = await Restaurant.create([subBranchData], { session });

    // Step 4: Duplicate Categories, Subcategories, and Food Items for Sub-Branch
    for (const category of categoriesOfMainBranch) {
      // Duplicate Category
      const newCategory = await FoodCategory.create(
        [
          {
            ...category.toObject(),
            _id: undefined, // Ensure a new ID is generated
            subCategory: [],
            restaurant_id: newSubBranch[0]._id,
          },
        ],
        { session }
      );

      // Duplicate Subcategories for the New Category
      const subCategories = subCategoriesOfMainBranch.filter(
        (sub) => sub.category_id.toString() === category._id.toString()
      );

      for (const subCategory of subCategories) {
        const newSubCategory = await FoodSubCategory.create(
          [
            {
              ...subCategory.toObject(),
              _id: undefined, // Ensure a new ID is generated
              category_id: newCategory[0]._id,
            },
          ],
          { session }
        );

        // Push the new subCategory into newCategory's subCategory array
        await FoodCategory.findByIdAndUpdate(
          newCategory[0]._id,
          { $push: { subCategory: newSubCategory[0] } },
          { session, new: true }
        );

        // Duplicate Food Items that belong to this subCategory
        const foodItemsForSubCategory = foodItemsOfMainBranch.filter(
          (item) =>
            item.category &&
            item.category._id.toString() === subCategory._id.toString()
        );

        const newFoodItems = foodItemsForSubCategory.map((foodItem) => ({
          ...foodItem.toObject(),
          _id: undefined, // Ensure a new ID is generated
          category: newSubCategory[0], // Assign the new subCategory
          restaurant_id: newSubBranch[0]._id,
        }));

        await FoodItems.insertMany(newFoodItems, { session });
      }
    }
    // Step 5: Handle Food Items directly linked to Categories (not SubCategories)
    const foodItemsForCategory = foodItemsOfMainBranch.filter(
      (item) =>
        !item.category || (item.category._id && !item.category.subCategory) // Ensure it's a category, not subcategory
    );

    const newFoodItemsForCategory = foodItemsForCategory.map((foodItem) => {
      // Ensure that category is assigned properly if missing
      if (!foodItem.category) {
        throw new Error("FoodItem must have a valid category"); // Prevent inserting invalid data
      }

      return {
        ...foodItem.toObject(),
        _id: undefined, // Ensure a new ID is generated
        category: foodItem.category,
        restaurant_id: newSubBranch[0]._id, // Ensure restaurant_id is updated to the new sub-branch
      };
    });

    if (newFoodItemsForCategory.length > 0) {
      // Insert the new food items into the sub-branch
      await FoodItems.insertMany(newFoodItemsForCategory, { session });
    } else {
      console.log("No new food items to insert.");
    }

    // // Step 6: Push the newSubBranch's _id to mainBranch's branches field
    // await Restaurant.findByIdAndUpdate(
    //   mainBranchId,
    //   { $push: { branches: newSubBranch[0]._id } },
    //   { session }
    // );
    const existingBusiness = await Business.findOne({
      businessId: mainBranchId,
    }).session(session);

    if (existingBusiness) {
      // Update the existing Business by pushing the subBranchId
      await Business.findOneAndUpdate(
        { businessId: mainBranchId },
        { $push: { branches: newSubBranch[0]?._id } },
        { session }
      );
    } else {
      // Create a new Business document
      const business = new Business({
        businessId: mainBranchId,
        businessName: mainBranch.restaurantName,
        address: {
          state: mainBranch.state,
          district: mainBranch.district,
          streetAddress: mainBranch.streetAddress,
        },
        image: mainBranch.image,
        contactNumber: mainBranch.phoneNumber,
        email: mainBranch.email,
        branches: [newSubBranch[0]?._id], // Initialize with the first subBranchId
      });
      await business.save({ session });
    }
    await adminUser.findOneAndUpdate(
      {
        $or: [
          { associatedWith: mainBranchId },
          { associatedWith: { $elemMatch: { $eq: mainBranchId } } },
        ],
      },
      [
        // MongoDB pipeline for conditional update
        {
          $set: {
            // Convert `associatedWith` to an array if it's not already
            associatedWith: {
              $cond: {
                if: { $not: { $isArray: "$associatedWith" } },
                then: { $ifNull: [["$associatedWith"], []] },
                else: "$associatedWith",
              },
            },
          },
        },
        {
          // Add the new value to the array, ensuring no duplicates
          $addFields: {
            associatedWith: {
              $cond: {
                if: {
                  $not: { $in: [newSubBranch[0]?._id, "$associatedWith"] },
                },
                then: {
                  $concatArrays: ["$associatedWith", [newSubBranch[0]?._id]],
                },
                else: "$associatedWith",
              },
            },
          },
        },
      ],
      { session, new: true }
    );

    // Step 7: Commit the Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Sub-branch added successfully",
      subBranch: newSubBranch[0],
      mainBranchId: mainBranchId,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error("Error adding sub-branch:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get restaurant auto-apply settings
exports.getAutoApplySettings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant.autoApplySettings || {
        enabled: false,
        delay: 0,
        minMatchPercentage: 0,
        visibility: "all",
      },
    });
  } catch (err) {
    errorLogger.error("Error getting auto-apply settings", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update restaurant auto-apply settings
exports.updateAutoApplySettings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { enabled, delay, minMatchPercentage, visibility } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    restaurant.autoApplySettings = {
      enabled: enabled ?? restaurant.autoApplySettings?.enabled ?? false,
      delay: delay ?? restaurant.autoApplySettings?.delay ?? 0,
      minMatchPercentage: minMatchPercentage ?? restaurant.autoApplySettings?.minMatchPercentage ?? 0,
      visibility: visibility ?? restaurant.autoApplySettings?.visibility ?? "all",
    };

    await restaurant.save();
    
    console.log(restaurant.autoApplySettings)
    // Manage the scheduler task based on auto-apply settings
    await schedulerService.manageAutoApplyTask(restaurantId, restaurant.autoApplySettings);

    res.status(200).json({
      success: true,
      data: restaurant.autoApplySettings,
    });
  } catch (err) {
    errorLogger.error("Error updating auto-apply settings", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};
