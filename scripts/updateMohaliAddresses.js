const mongoose = require('mongoose');

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";
const collectionName = "restaurants";

// --- Realistic Address Mapping (Restaurant Name -> New Address) ---
// Note: These are still examples, but formatted more realistically without "(Example)"
const mohaliAddressMap = {
  "Barbeque Nation - Mohali": "SCO 39, Madhya Marg, Sector 26, Chandigarh", // Often listed under Chandigarh
  "Boston Bites": "Booth 12, Phase 7 Market, Mohali",
  "Sindhi Sweets": "SCO 50, Phase 5 Market, Mohali",
  "Stage": "Plot 10, Sector 82, JLPL Industrial Area, Mohali",
  "Peddler's": "Hotel President, Near Sector 34A, Chandigarh",
  "Katani Dhaba": "Booth 120, Phase 7 Market, Mohali", // Example location
  "The Brew Estate Mohali": "SCO 25, Sector 70, Mohali",
  "Pyramid Cafe Lounge Bar": "Elante Mall, Industrial Area Phase I, Chandigarh", // Common area
  "Sethi Dhaba": "Ambala Chandigarh Expy, Zirakpur",
  "Nagpal Pure Veg Foods": "SCF 45, Phase 9 Market, Mohali",
  "Domino's Pizza": "Phase 5, Mohali", // Example of one branch
  "Nik Baker's": "SCO 441-442, Sector 35C, Chandigarh", // Popular Chandigarh branch near Mohali
  "Haveli Heritage": "Chandigarh-Ropar Road, NH 205",
  "Amrik Sukhdev Dhaba (Placeholder)": "GT Road, Murthal, Haryana", // Actual location is far but kept name
  "Pal Dhaba (Placeholder)": "SCO 151-152, Sector 28D, Chandigarh"
};

async function updateAddresses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    const db = mongoose.connection.db;
    const restaurantsCollection = db.collection(collectionName);

    console.log('Fetching Mohali restaurants...');
    const mohaliRestaurants = await restaurantsCollection.find({ district: "Mohali" }).toArray();

    if (mohaliRestaurants.length === 0) {
      console.log('No restaurants found with district "Mohali". Nothing to update.');
      return;
    }

    console.log(`Found ${mohaliRestaurants.length} Mohali restaurants. Attempting to update addresses...`);
    let updatedCount = 0;
    const updatePromises = [];

    for (const restaurant of mohaliRestaurants) {
      const newAddress = mohaliAddressMap[restaurant.restaurantName];
      if (newAddress && newAddress !== restaurant.streetAddress) {
        console.log(`Updating address for "${restaurant.restaurantName}" to "${newAddress}"`);
        updatePromises.push(
          restaurantsCollection.updateOne(
            { _id: restaurant._id },
            { $set: { streetAddress: newAddress } }
          )
        );
        updatedCount++;
      } else if (newAddress) {
         console.log(`Address for "${restaurant.restaurantName}" is already up-to-date. Skipping.`);
      } else {
        console.warn(`No new address mapping found for "${restaurant.restaurantName}". Skipping.`);
      }
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Successfully updated addresses for ${updatedCount} restaurants.`);
    } else {
        console.log("No addresses required updating.");
    }

  } catch (err) {
    console.error("An error occurred during the address update process:", err);
  } finally {
    // Close the Mongoose connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script ---
updateAddresses(); 