const mongoose = require('mongoose');
// Adjust the path to your ItemType model file
const ItemType = require('../modules/venue/models/itemType.model.js');

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Item Types to Seed ---
const itemTypesToSeed = [
  { name: "Vegetarian", category: "FOOD_TYPE" },
  { name: "Non-Vegetarian", category: "FOOD_TYPE" },
  { name: "Cold", category: "DRINK_TYPE" },
  { name: "Hot", category: "DRINK_TYPE" },
];

async function seedItemTypes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    console.log('Seeding Item Types...');

    for (const itemData of itemTypesToSeed) {
      const filter = { name: itemData.name, category: itemData.category };
      const update = {
        // We only need to define fields to set on insert, as isActive defaults to true
        $setOnInsert: {
          name: itemData.name,
          category: itemData.category,
          isActive: true // Explicitly set isActive on creation if needed, though model has default
        }
      };
      const options = {
        upsert: true, // Create if document does not exist
        new: true,    // Return the new document if created, or the existing one if found
        setDefaultsOnInsert: true // Apply schema defaults on insert
      };

      const result = await ItemType.findOneAndUpdate(filter, update, options);

      // Check if the document was newly created or already existed
      // Note: Comparing timestamps might be unreliable if updates happen close together.
      // A simple check based on presence is usually sufficient for seeding.
      if (result) {
         console.log(`Ensured ItemType exists: Name='${result.name}', Category='${result.category}'`);
      } else {
         // This case shouldn't ideally happen with findOneAndUpdate + upsert unless there's an error before write
          console.warn(`Could not verify ItemType: Name='${itemData.name}', Category='${itemData.category}'`);
      }
    }

    console.log('Finished seeding Item Types.');

  } catch (err) {
    console.error("An error occurred during the ItemType seeding process:", err);
  } finally {
    // Close the Mongoose connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script ---
seedItemTypes(); 