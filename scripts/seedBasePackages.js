const mongoose = require('mongoose');

// --- Model Imports ---
// Adjust path if necessary. Assuming your Package model is here:
const Package = require('../modules/venue/models/package.model.js');

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Realistic Base Packages to Seed ---
const basePackagesToSeed = [
  {
    name: "Gold Tier Package",
    description: "A premium package offering a wide selection of items and services."
  },
  {
    name: "Silver Tier Package",
    description: "A balanced package with popular choices at a moderate price point."
  },
  {
    name: "Bronze Tier Package",
    description: "An economical package suitable for smaller gatherings or budget events."
  },
  {
    name: "Birthday Celebration Package",
    description: "Specially curated items and options for birthday parties."
  },
  {
    name: "Corporate Event Package",
    description: "Tailored for business meetings, conferences, and corporate lunches/dinners."
  },
  {
    name: "Live Entertainment Package", // The package ID you hardcoded previously
    description: "Package offerings for live shows, concerts and stand-up comedy events."
  },
  {
    name: "Wedding Standard Package",
    description: "A comprehensive package designed for wedding receptions and ceremonies."
  }
];

// --- Main Seeding Function ---
async function seedBasePackages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    console.log('Seeding Base Packages...');
    let createdCount = 0;
    let updatedCount = 0;

    for (const pkgData of basePackagesToSeed) {
        const filter = { name: pkgData.name };
        const update = {
            $set: { // Update description if package name already exists
                description: pkgData.description
            },
            $setOnInsert: { // Set name only when creating a new document
                name: pkgData.name
                // Add other fields with defaults if your Package model has them e.g., isActive: true
            }
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const result = await Package.findOneAndUpdate(filter, update, options);

        if (result) {
            const isNew = Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;
            console.log(`${isNew ? 'Created' : 'Updated'} Package: Name='${result.name}' (ID: ${result._id})`);
            if (isNew) createdCount++; else updatedCount++;
        } else {
             console.warn(`Could not verify Package upsert: Name='${pkgData.name}'`);
        }
    }
    console.log(`Finished seeding Base Packages. Created: ${createdCount}, Updated: ${updatedCount}.`);

  } catch (err) {
    console.error("\n--- An error occurred during the Base Package seeding process ---");
    console.error(err.message);
    // console.error(err); // Uncomment for full stack trace
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script ---
seedBasePackages(); 