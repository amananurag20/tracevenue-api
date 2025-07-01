const mongoose = require('mongoose');

// --- Model Imports ---
// Adjust paths if necessary
const Variant = require('../modules/venue/models/variant.model.js');
const Package = require('../modules/venue/models/package.model.js'); // Assuming path
const MasterMenu = require('../modules/venue/models/masterMenu.model.js');
const Restaurant = require('../models/RestaurantModels.js'); // Assuming path from previous script

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Packages to Ensure Exist ---
const packagesToSeed = [
  { name: "Gold Package" },
  { name: "Silver Package" },
  { name: "Bronze Party Package" },
  { name: "Custom Event Package" } // For potentially customized variants
];

// --- Variants to Seed ---
const variantsToSeed = [
  {
    name: "Standard Veg Buffet",
    packageName: "Silver Package",
    description: "A balanced vegetarian buffet selection.",
    menuItemNames: ["Paneer Tikka", "Dal Makhani", "Veg Biryani", "Tandoori Roti", "Gulab Jamun", "Coca-Cola"],
    minPersons: 20,
    maxPersons: 50,
    cost: 800,
    isCustomized: false,
  },
  {
    name: "Premium Non-Veg Dinner",
    packageName: "Gold Package",
    description: "Includes premium non-vegetarian main course and starters.",
    menuItemNames: ["Paneer Tikka", "Butter Chicken", "Dal Makhani", "Veg Biryani", "Tandoori Roti", "Gulab Jamun", "Masala Chai"],
    minPersons: 50,
    maxPersons: 150,
    cost: 1500,
    isCustomized: false,
  },
  {
    name: "Basic Snack Package",
    packageName: "Bronze Party Package",
    description: "Light snacks and beverages for smaller gatherings.",
    menuItemNames: ["Paneer Tikka", "Veg Hakka Noodles", "Coca-Cola", "Masala Chai"],
    minPersons: 10,
    maxPersons: 30,
    cost: 400,
    isCustomized: false,
  },
  {
    name: "Continental Lunch Special",
    packageName: "Silver Package",
    description: "Focuses on Pizza and Noodles/Pasta.",
    menuItemNames: ["Margherita Pizza", "Veg Hakka Noodles", "Coca-Cola"],
    minPersons: 15,
    maxPersons: 40,
    cost: 750,
    isCustomized: false,
  },
  {
    name: "High Tea Assortment",
    packageName: "Bronze Party Package",
    description: "Assorted snacks suitable for high tea.",
    menuItemNames: ["Paneer Tikka", "Gulab Jamun", "Masala Chai"],
    minPersons: 10,
    maxPersons: 50,
    cost: 350,
    isCustomized: false,
  },
];

// --- Helper Function to Get IDs ---
async function getIdsFromNames(model, names, cacheMap) {
    const ids = [];
    if (!Array.isArray(names)) {
        console.warn(`Expected an array of names for ${model.modelName}, but got:`, names);
        return ids;
    }
    for (const name of names) {
        let id = cacheMap.get(name);
        if (!id) {
            const doc = await model.findOne({ name: name }, '_id'); // Only fetch ID
            if (doc) {
                id = doc._id;
                cacheMap.set(name, id); // Cache it
            } else {
                console.warn(`Warning: Could not find document with name="${name}" in ${model.modelName} collection.`);
            }
        }
        if (id) {
            ids.push(id);
        }
    }
    return ids;
}

// --- Main Seeding Function ---
async function seedVariants() {
  const packageIds = new Map();
  const menuItemIds = new Map();
  let restaurantId = null;

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    // --- Step 1: Ensure Packages Exist (Upsert) ---
    console.log('Ensuring base packages exist...');
    for (const pkgData of packagesToSeed) {
        const filter = { name: pkgData.name };
        // Assuming Package model only needs 'name' on creation
        const update = { $setOnInsert: { name: pkgData.name } };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const result = await Package.findOneAndUpdate(filter, update, options);
        if (result) {
            console.log(`Ensured Package exists: Name='${result.name}'`);
            packageIds.set(result.name, result._id); // Cache ID
        } else {
             console.warn(`Could not verify Package upsert: Name='${pkgData.name}'`);
        }
    }
    console.log('Base package check complete.');

    // --- Step 2: Fetch a Restaurant ID ---
    console.log('Fetching a restaurant ID...');
    // Fetch the first restaurant found in Mohali to associate as creator
    const restaurant = await Restaurant.findOne({ district: "Mohali" }, '_id');
    if (!restaurant) {
        console.error('Error: No restaurants found in Mohali district. Cannot set createdBy for variants.');
        return; // Stop script if no restaurant found
    }
    restaurantId = restaurant._id;
    console.log(`Using Restaurant ID for createdBy: ${restaurantId}`);

    // --- Step 3: Pre-fetch Master Menu Items ---
    console.log('Fetching Master Menu items...');
    const allMenuItems = await MasterMenu.find({}, 'name _id');
    allMenuItems.forEach(item => menuItemIds.set(item.name, item._id));
    console.log(`Fetched ${menuItemIds.size} Master Menu items.`);

    // --- Step 4: Seed Variants ---
    console.log('Seeding Variants...');
    let createdCount = 0;
    let updatedCount = 0;

    for (const variantData of variantsToSeed) {
      // Resolve Package ObjectId
      const resolvedPackageId = packageIds.get(variantData.packageName);
      if (!resolvedPackageId) {
          console.warn(`Skipping variant "${variantData.name}" because Package "${variantData.packageName}" was not found.`);
          continue;
      }

      // Resolve MasterMenu ObjectIds
      const resolvedMenuItemIds = await getIdsFromNames(MasterMenu, variantData.menuItemNames || [], menuItemIds);

      // Validate that all menu items were found
      if (!variantData.menuItemNames || variantData.menuItemNames.length !== resolvedMenuItemIds.length) {
          const missingItems = (variantData.menuItemNames || []).filter(name => !menuItemIds.has(name));
          console.warn(`Skipping variant "${variantData.name}" due to missing MasterMenu item references: ${missingItems.join(', ')}`);
          continue;
      }

      // Upsert the variant
      const filter = { name: variantData.name, packageId: resolvedPackageId }; // Name + Package ID defines uniqueness
      const update = {
        $set: { // Update fields if found
            description: variantData.description,
            menuItems: resolvedMenuItemIds,
            minPersons: variantData.minPersons,
            maxPersons: variantData.maxPersons,
            cost: variantData.cost,
            isCustomized: variantData.isCustomized,
            createdBy: restaurantId,
            // paidServices and freeServices are omitted
        },
        $setOnInsert: { // Set only on insert
            name: variantData.name,
            packageId: resolvedPackageId,
            // Timestamps will be added automatically
        }
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      };

      try {
        const result = await Variant.findOneAndUpdate(filter, update, options);
        if (result) {
            const isNew = Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;
            console.log(`${isNew ? 'Created' : 'Updated'} Variant: Name='${result.name}' (Package: ${variantData.packageName})`);
            if (isNew) createdCount++; else updatedCount++;
        } else {
             console.warn(`Could not verify Variant upsert: Name='${variantData.name}'`);
        }
      } catch(err) {
           if (err.code === 11000) {
              console.warn(`Variant "${variantData.name}" for package "${variantData.packageName}" likely already exists (duplicate key error). Skipping.`);
           } else {
               console.error(`Error upserting variant "${variantData.name}":`, err);
           }
      }
    }

    console.log(`Finished seeding Variants. Created: ${createdCount}, Updated: ${updatedCount}.`);

  } catch (err) {
    console.error("An error occurred during the Variant seeding process:", err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script ---
seedVariants(); 