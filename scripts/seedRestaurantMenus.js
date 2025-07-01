const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// --- Model Imports ---
// Adjust paths if necessary
const RestaurantMenu = require('../modules/venue/models/restaurantMenu.model.js');
const MasterMenu = require('../modules/venue/models/masterMenu.model.js');
const Restaurant = require('../models/RestaurantModels.js'); // Assuming path from previous script

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Get Restaurant ID from command line arguments ---
const restaurantIdString = process.argv[2];

// --- Validation --- //
if (!restaurantIdString) {
    console.error('Error: Please provide a Restaurant ID as a command-line argument.');
    console.log('Usage: node scripts/seedRestaurantMenus.js <restaurant_object_id>');
    process.exit(1); // Exit with error code
}
try {
    // Validate if the provided string is a valid ObjectId format
    new ObjectId(restaurantIdString);
} catch (e) {
    console.error(`Error: Invalid Restaurant ID format provided: "${restaurantIdString}"`);
    process.exit(1); // Exit with error code
}

// --- Main Seeding Function ---
async function seedRestaurantMenu(targetRestaurantId) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    // 1. Validate the target Restaurant exists
    console.log(`Validating Restaurant ID: ${targetRestaurantId}...`);
    const restaurant = await Restaurant.findById(targetRestaurantId, '_id').lean(); // Only fetch ID, use lean
    if (!restaurant) {
        throw new Error(`Restaurant with ID ${targetRestaurantId} not found.`);
    }
    console.log(`Restaurant ${targetRestaurantId} found.`);

    // 2. Fetch all MasterMenu item IDs
    console.log('Fetching all Master Menu item IDs...');
    const allMasterItems = await MasterMenu.find({}, '_id').lean(); // Fetch only IDs, use lean
    const masterItemIds = allMasterItems.map(item => item._id);
    console.log(`Found ${masterItemIds.length} Master Menu items.`);

    if (masterItemIds.length === 0) {
        console.warn('Warning: No Master Menu items found in the database. The restaurant menu will be created/updated with an empty items list.');
    }

    // 3. Upsert the RestaurantMenu
    console.log(`Upserting RestaurantMenu for Restaurant ID: ${targetRestaurantId}...`);
    const filter = { restaurantId: targetRestaurantId };
    const update = {
        $set: { // Update these fields if document exists
            items: masterItemIds,
            // Initialize/reset disabled lists as empty arrays based on schema
            disabledCategories: [],
            disabledSubCategories: [],
            disabledItems: []
        },
        $setOnInsert: { // Set only when creating a new document
            restaurantId: targetRestaurantId,
            // items will be set by $set even on insert due to upsert nature
            // timestamps will be added automatically
        }
    };
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    };

    const result = await RestaurantMenu.findOneAndUpdate(filter, update, options);

    if (result) {
         const isNew = Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;
         console.log(`${isNew ? 'Created' : 'Updated'} RestaurantMenu for Restaurant ${targetRestaurantId} with ${masterItemIds.length} items.`);
    } else {
        // Should not happen with upsert:true and new:true unless there's a fundamental issue
        console.error('Error: Failed to upsert RestaurantMenu, result was nullish.');
    }

    console.log('Finished seeding RestaurantMenu.');

  } catch (err) {
    console.error("\n--- An error occurred during the RestaurantMenu seeding process ---");
    console.error(err.message);
    // console.error(err); // Uncomment for full stack trace
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script with the provided ID ---
const restaurantObjectId = new ObjectId(restaurantIdString); // Convert validated string to ObjectId
seedRestaurantMenu(restaurantObjectId); 