const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// --- Model Imports ---
// Adjust paths if necessary
const Variant = require('../modules/venue/models/variant.model.js');
const Package = require('../modules/venue/models/package.model.js'); // Assuming path
const MasterMenu = require('../modules/venue/models/masterMenu.model.js');
const Restaurant = require('../models/RestaurantModels.js'); // Assuming path

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Get Restaurant ID from command line arguments ---
const restaurantIdString = process.argv[2];

// --- Hardcoded Target Package ID ---
const targetPackageIdString = "681af8592667885fc41499eb";

// --- Validation --- //
if (!restaurantIdString) {
    console.error('Error: Please provide a Restaurant ID as a command-line argument.');
    console.log('Usage: node scripts/seedPackagesAndVariantsForRestaurant.js <restaurant_object_id>');
    process.exit(1); // Exit with error code
}
try {
    new ObjectId(restaurantIdString);
} catch (e) {
    console.error(`Error: Invalid Restaurant ID format provided: "${restaurantIdString}"`);
    process.exit(1); // Exit with error code
}
try {
    new ObjectId(targetPackageIdString); // Also validate the hardcoded package ID format
} catch (e) {
     console.error(`Error: Invalid Target Package ID format hardcoded in script: "${targetPackageIdString}"`);
    process.exit(1);
}

// --- Packages to Seed - REMOVED ---
// const packagesToSeed = [...];

// --- Realistic Variants to Seed (packageName removed) ---
// const variantsToSeed = [
//   {
//     name: "Live Show Snack Combo",
//     description: "Perfect for enjoying light bites during a stand-up comedy or acoustic night.",
//     menuItemNames: ["Paneer Tikka", "Veg Spring Rolls", "French Fries", "Coca-Cola", "Masala Chai"],
//     minPersons: 20,
//     maxPersons: 60,
//     cost: 600,
//     isCustomized: false,
//   },
//   {
//     name: "Concert Non-Veg Special",
//     description: "A hearty non-veg spread for music lovers attending live gigs.",
//     menuItemNames: ["Chicken Tikka", "Butter Chicken", "Veg Biryani", "Tandoori Roti", "Gulab Jamun", "Coca-Cola"],
//     minPersons: 50,
//     maxPersons: 150,
//     cost: 1400,
//     isCustomized: false,
//   },
//   {
//     name: "Acoustic Night Veg Delight",
//     description: "Specially curated for cozy live music evenings with vegetarian cuisine.",
//     menuItemNames: ["Paneer Tikka", "Dal Makhani", "Jeera Rice", "Garlic Naan", "Gulab Jamun", "Masala Chai"],
//     minPersons: 30,
//     maxPersons: 100,
//     cost: 1000,
//     isCustomized: false,
//   },
//   {
//     name: "Rock Night Premium Buffet",
//     description: "A premium buffet for high-energy concert events with varied tastes.",
//     menuItemNames: ["Chicken Lollipop", "Paneer Tikka", "Butter Chicken", "Veg Hakka Noodles", "Tandoori Roti", "Chocolate Brownie", "Coca-Cola"],
//     minPersons: 100,
//     maxPersons: 300,
//     cost: 1800,
//     isCustomized: false,
//   },
//   {
//     name: "Stand-up Show Lite Bites",
//     description: "Quick bites and drinks to enjoy during casual comedy shows.",
//     menuItemNames: ["Veg Momos", "Masala Fries", "Chilli Paneer", "Mocktail"],
//     minPersons: 15,
//     maxPersons: 50,
//     cost: 500,
//     isCustomized: false,
//   }
// ];


const variantsToSeed = [
  {
    name: "Silver Wedding Delight",
    description: "An elegant vegetarian and non-vegetarian blend ideal for intimate weddings.",
    menuItemNames: [
      "Hara Bhara Kabab",
      "Paneer Tikka",
      "Chicken Tikka",
      "Dal Makhani",
      "Shahi Paneer",
      "Butter Chicken",
      "Jeera Rice",
      "Butter Naan",
      "Gulab Jamun",
      "Mocktail"
    ],
    minPersons: 100,
    maxPersons: 300,
    cost: 1399,
    isCustomized: false,
  },
  {
    name: "Gold Maharaja Feast",
    description: "A regal buffet offering rich flavors for grand wedding celebrations.",
    menuItemNames: [
      "Tandoori Mushroom",
      "Amritsari Fish",
      "Chicken Malai Tikka",
      "Paneer Lababdar",
      "Shahi Dal",
      "Murg Makhani",
      "Kashmiri Pulao",
      "Garlic Naan",
      "Kesar Rasmalai",
      "Mocktail"
    ],
    minPersons: 200,
    maxPersons: 500,
    cost: 1699,
    isCustomized: false,
  },
  {
    name: "Platinum Royal Affair",
    description: "A luxurious setup perfect for large-scale weddings with diverse tastes.",
    menuItemNames: [
      "Paneer Shashlik",
      "Mutton Seekh",
      "Afghani Chicken",
      "Paneer Pasanda",
      "Dal Bukhara",
      "Hyderabadi Dum Biryani",
      "Zafrani Pulao",
      "Roomali Roti",
      "Tiramisu",
      "Mocktail"
    ],
    minPersons: 300,
    maxPersons: 800,
    cost: 2199,
    isCustomized: false,
  },
  {
    name: "Diamond Signature Experience",
    description: "An extravagant culinary journey for the most premium wedding experiences.",
    menuItemNames: [
      "Dahi Ke Kebab",
      "Murgh Angara",
      "Raan-E-Sikandari",
      "Paneer Khurchan",
      "Nargisi Kofta",
      "Murgh Handi Lazeez",
      "Subz Biryani",
      "Butter Garlic Naan",
      "Pan Kulfi",
      "Live Pasta Counter"
    ],
    minPersons: 500,
    maxPersons: 1000,
    cost: 2799,
    isCustomized: false,
  }
];



// --- Helper Function to Get IDs --- (Keep as is)
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
async function seedPackagesAndVariantsForRestaurant(targetRestaurantId) {
  // const packageIds = new Map(); // REMOVED
  const menuItemIds = new Map();
  let targetPackageId = null; // To store the validated Package ObjectId

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    // 1. Validate the target Restaurant exists
    console.log(`Validating Restaurant ID: ${targetRestaurantId}...`);
    const restaurant = await Restaurant.findById(targetRestaurantId, '_id').lean();
    if (!restaurant) {
        throw new Error(`Restaurant with ID ${targetRestaurantId} not found.`);
    }
    console.log(`Restaurant ${targetRestaurantId} found.`);

    // 2. Ensure Target Package Exists
    console.log(`Validating Target Package ID: ${targetPackageIdString}...`);
    targetPackageId = new ObjectId(targetPackageIdString); // Convert string to ObjectId
    const targetPackage = await Package.findById(targetPackageId, '_id name').lean();
    if (!targetPackage) {
        throw new Error(`Target Package with ID ${targetPackageIdString} not found.`);
    }
    console.log(`Target Package found: Name='${targetPackage.name}' (ID: ${targetPackageIdString})`);

    // 3. Pre-fetch Master Menu Items (Keep as is)
    console.log('Fetching Master Menu items...');
    const allMenuItems = await MasterMenu.find({}, 'name _id').lean();
    allMenuItems.forEach(item => menuItemIds.set(item.name, item._id));
    console.log(`Fetched ${menuItemIds.size} Master Menu items.`);

    // 4. Seed Variants for the specific restaurant and specific package
    console.log(`Seeding Variants for Restaurant ID: ${targetRestaurantId} and Package ID: ${targetPackageIdString}...`);
    let createdCount = 0;
    let updatedCount = 0;

    for (const variantData of variantsToSeed) {
      // const resolvedPackageId = packageIds.get(variantData.packageName); // REMOVED
      // Use the validated target package ID directly
      const resolvedPackageId = targetPackageId;

      // Resolve MasterMenu ObjectIds (Keep as is)
      const resolvedMenuItemIds = await getIdsFromNames(MasterMenu, variantData.menuItemNames || [], menuItemIds);
      if (!variantData.menuItemNames || variantData.menuItemNames.length !== resolvedMenuItemIds.length) {
          const missingItems = (variantData.menuItemNames || []).filter(name => !menuItemIds.has(name));
          console.warn(`Skipping variant "${variantData.name}" due to missing MasterMenu item references: ${missingItems.join(', ') || 'N/A'}`);
          continue;
      }

      // Upsert the variant
      const filter = { name: variantData.name, packageId: resolvedPackageId }; // Use specific package ID in filter
      const update = {
        $set: { // Update fields if found
            description: variantData.description,
            menuItems: resolvedMenuItemIds,
            minPersons: variantData.minPersons,
            maxPersons: variantData.maxPersons,
            cost: variantData.cost,
            isCustomized: variantData.isCustomized,
            createdBy: targetRestaurantId, // Link to the specific restaurant
            // packageId: resolvedPackageId // No need to $set packageId as it's in the filter
        },
        $setOnInsert: { // Set only on insert
            name: variantData.name,
            packageId: resolvedPackageId, // Set packageId on insert
        }
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      try {
        const result = await Variant.findOneAndUpdate(filter, update, options);
        if (result) {
            const isNew = Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;
            console.log(`${isNew ? 'Created' : 'Updated'} Variant: Name='${result.name}' (Package ID: ${resolvedPackageId})`); // Updated log
            if (isNew) createdCount++; else updatedCount++;
        } else {
             console.warn(`Could not verify Variant upsert: Name='${variantData.name}'`);
        }
      } catch(err) {
           if (err.code === 11000) {
              console.warn(`Variant "${variantData.name}" for package ID "${resolvedPackageId}" likely already exists (duplicate key error). Skipping.`); // Updated log
           } else {
               console.error(`Error upserting variant "${variantData.name}":`, err);
           }
      }
    }

    console.log(`Finished seeding Variants for Restaurant ${targetRestaurantId} (Package: ${targetPackageIdString}). Created: ${createdCount}, Updated: ${updatedCount}.`); // Updated log

  } catch (err) {
    console.error("\n--- An error occurred during the Package/Variant seeding process ---");
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script with the provided Restaurant ID ---
const restaurantObjectId = new ObjectId(restaurantIdString);
seedPackagesAndVariantsForRestaurant(restaurantObjectId); 