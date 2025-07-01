const mongoose = require('mongoose');
// Adjust the path to your Category model file
const Category = require('../modules/venue/models/categories.model.js');

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Categories to Seed (Structured for potential dependencies) ---
// Define categories, including parent references by name for clarity
const categoriesToSeed = [
  // --- Top Level Categories ---
  { name: "Starters", hasCuisine: true, parents: [] },
  { name: "Soups", hasCuisine: true, parents: [] },
  { name: "Salads", hasCuisine: true, parents: [] },
  { name: "Main Course", hasCuisine: true, parents: [] },
  { name: "Indian Breads", hasCuisine: false, parents: [] },
  { name: "Rice & Biryani", hasCuisine: true, parents: [] },
  { name: "Noodles & Pasta", hasCuisine: true, parents: [] }, // Combined example
  { name: "Pizza", hasCuisine: true, parents: [] },
  { name: "Burgers & Sandwiches", hasCuisine: true, parents: [] }, // Combined example
  { name: "Desserts", hasCuisine: false, parents: [] },
  { name: "Beverages", hasCuisine: false, parents: [] }, // Parent for drinks

  // --- Subcategories (Reference parents by name) ---
  { name: "Vegetarian Starters", hasCuisine: true, parents: ["Starters"] },
  { name: "Non-Vegetarian Starters", hasCuisine: true, parents: ["Starters"] },
  { name: "Vegetarian Main Course", hasCuisine: true, parents: ["Main Course"] },
  { name: "Non-Vegetarian Main Course", hasCuisine: true, parents: ["Main Course"] },
  { name: "Tandoori Breads", hasCuisine: false, parents: ["Indian Breads"] },
  { name: "Mocktails", hasCuisine: false, parents: ["Beverages"] },
  { name: "Cocktails", hasCuisine: false, parents: ["Beverages"] },
  { name: "Hot Beverages", hasCuisine: false, parents: ["Beverages"] },
  { name: "Cold Beverages", hasCuisine: false, parents: ["Beverages"] },
  { name: "Milkshakes & Smoothies", hasCuisine: false, parents: ["Beverages"] },
];

async function seedCategories() {
  const createdCategoryIds = new Map(); // To store IDs of created/found categories

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    console.log('Seeding Categories...');

    for (const catData of categoriesToSeed) {
      // 1. Resolve Parent Category ObjectIds
      const parentObjectIds = [];
      if (catData.parents && catData.parents.length > 0) {
        for (const parentName of catData.parents) {
          let parentId = createdCategoryIds.get(parentName);
          if (!parentId) {
            // If parent wasn't processed yet (e.g., bad ordering) or doesn't exist, try finding it
            console.warn(`Parent category "${parentName}" not found in cache for "${catData.name}". Attempting DB lookup.`);
            const parentCategory = await Category.findOne({ name: parentName });
            if (parentCategory) {
              parentId = parentCategory._id;
              createdCategoryIds.set(parentName, parentId); // Cache it
            } else {
              console.error(`Error: Parent category "${parentName}" specified for "${catData.name}" does not exist in DB. Skipping parent association.`);
              continue; // Skip this parent
            }
          }
          parentObjectIds.push(parentId);
        }
      }

      // 2. Upsert the category
      const filter = { name: catData.name };
      const update = {
        $set: { // Use $set to update existing fields if found
            hasCuisine: catData.hasCuisine,
            parentCategories: parentObjectIds,
         },
        $setOnInsert: { // Fields only set when creating
          name: catData.name,
          // hasCuisine & parentCategories are handled by $set
        }
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      };

      try {
        const result = await Category.findOneAndUpdate(filter, update, options);
        if (result) {
           console.log(`Ensured Category exists: Name='${result.name}', Parents='${result.parentCategories.length}', HasCuisine='${result.hasCuisine}'`);
           createdCategoryIds.set(result.name, result._id); // Store/update ID in cache
        } else {
            console.warn(`Could not verify Category upsert: Name='${catData.name}'`);
        }
      } catch(err) {
          // Handle potential unique index violation if upsert logic fails under race conditions (less likely with findOneAndUpdate)
          if (err.code === 11000) {
              console.warn(`Category with name "${catData.name}" likely already exists (duplicate key error). Skipping.`);
              // Attempt to fetch and cache the ID if needed
              if (!createdCategoryIds.has(catData.name)){
                  const existing = await Category.findOne({ name: catData.name });
                  if (existing) createdCategoryIds.set(existing.name, existing._id);
              }
          } else {
              console.error(`Error upserting category "${catData.name}":`, err);
          }
      }
    }

    console.log('Finished seeding Categories.');

  } catch (err) {
    console.error("An error occurred during the Category seeding process:", err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script ---
seedCategories(); 