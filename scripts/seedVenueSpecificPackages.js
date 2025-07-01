const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// --- Model Imports ---
// Adjust paths if necessary
const Package = require("../modules/venue/models/package.model.js");
const EventType = require("../modules/venue/models/events.model.js");
const Venue = require("../models/RestaurantModels.js"); // NEW - Use Restaurant model as the Venue source
const Variant = require("../modules/venue/models/variant.model.js"); // Import Variant model

// --- Configuration ---
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Get Venue ID from command line arguments ---
const venueIdString = process.argv[2];

// --- Validation --- //
if (!venueIdString) {
  console.error("Error: Please provide a Venue ID as a command-line argument.");
  console.log(
    "Usage: node scripts/seedVenueSpecificPackages.js <venue_object_id>"
  );
  process.exit(1);
}
try {
  new ObjectId(venueIdString); // Validate ObjectId format
} catch (e) {
  console.error(`Error: Invalid Venue ID format provided: "${venueIdString}"`);
  process.exit(1);
}

// --- Realistic Packages to Seed for a Specific Venue ---
const packagesToSeedForVenue = [
  {
    name: "Timeless Vows Collection",
    description:
      "Craft unforgettable wedding memories with custom styling, fine cuisine, and dedicated planning.",
    eventTypeNames: [
      "Wedding Reception",
      "Wedding Ceremony",
      "Anniversary Celebration",
    ],
    variants: [
      {
        name: "Graceful Union",
        description:
          "An intimate setup perfect for small family weddings and vow renewals.",
        minPersons: 40,
        maxPersons: 90,
        cost: 1200,
      },
      {
        name: "Regal Celebration",
        description:
          "Includes premium decor, upgraded seating, and welcome drinks.",
        minPersons: 90,
        maxPersons: 180,
        cost: 2000,
      },
      {
        name: "Eternal Elegance",
        description:
          "A comprehensive luxury wedding experience with curated entertainment and gourmet dining.",
        minPersons: 150,
        maxPersons: 300,
        cost: 2800,
      },
    ],
  },
  {
    name: "Professional Impact Series",
    description:
      "Tailored packages to elevate business meetings, branding events, and professional networking.",
    eventTypeNames: ["Corporate Event", "Conference", "Product Launch"],
    variants: [
      {
        name: "Essentials Kit",
        description:
          "Compact solution for briefings, pitches, and internal meetings.",
        minPersons: 15,
        maxPersons: 40,
        cost: 750,
      },
      {
        name: "Executive Edge",
        description:
          "Mid-range package with AV support, refreshments, and coordination.",
        minPersons: 45,
        maxPersons: 90,
        cost: 1550,
      },
      {
        name: "Summit Premiere",
        description:
          "Comprehensive support for high-stake events with press coverage and branding tools.",
        minPersons: 90,
        maxPersons: 220,
        cost: 2400,
      },
    ],
  },
  {
    name: "Birthday Bash Concepts",
    description:
      "Creative birthday party experiences for all age groups with food, fun, and flair.",
    eventTypeNames: ["Birthday Party"],
    variants: [
      {
        name: "Joyful Sprouts",
        description: "Whimsical themes and playful decor for kids aged 3-10.",
        minPersons: 10,
        maxPersons: 25,
        cost: 600,
      },
      {
        name: "Party Pulse",
        description:
          "Music, lighting, and themed cake to liven up your special day.",
        minPersons: 25,
        maxPersons: 45,
        cost: 900,
      },
      {
        name: "Elite Bash",
        description:
          "Deluxe package with entertainers, photographers, and personalized menus.",
        minPersons: 45,
        maxPersons: 90,
        cost: 1450,
      },
    ],
  },
  {
    name: "Vibe & Connect Series",
    description:
      "Curated packages for vibrant social gatherings filled with ambience and hospitality.",
    eventTypeNames: ["Social Gathering", "Reunion"],
    variants: [
      {
        name: "Circle Time",
        description:
          "A cozy arrangement for intimate conversations and bonding.",
        minPersons: 15,
        maxPersons: 35,
        cost: 700,
      },
      {
        name: "Catch-Up Central",
        description:
          "Ideal for reconnecting with friends over drinks and bites.",
        minPersons: 35,
        maxPersons: 75,
        cost: 1100,
      },
      {
        name: "Legacy Reunion",
        description:
          "All-inclusive setup for larger family and school reunions with multimedia displays.",
        minPersons: 75,
        maxPersons: 140,
        cost: 1900,
      },
    ],
  },
];

// --- Helper Function to Get IDs (modified to also create if not found for EventTypes) ---
async function getIdsFromNames(
  model,
  names,
  cacheMap,
  createIfNotFound = false
) {
  const ids = [];
  if (!Array.isArray(names)) {
    console.warn(
      `Expected an array of names for ${model.modelName}, but got:`,
      names
    );
    return ids;
  }
  for (const name of names) {
    let id = cacheMap.get(name);
    if (!id) {
      // --- Determine field name for query and creation based on model ---
      let queryField = "name";
      let createData = { name: name };

      if (model.modelName === "Events") {
        // Or EventType, depending on your Mongoose model name
        queryField = "eventName";
        createData = { eventName: name };
      }
      // --- End field name determination ---

      let doc = await model.findOne({ [queryField]: name }, "_id");
      if (!doc && createIfNotFound) {
        console.log(
          `Creating ${model.modelName} with ${queryField}="${name}"...`
        );
        try {
          doc = await model.create(createData);
          console.log(
            `Successfully created ${model.modelName}: ${name} (ID: ${doc._id})`
          );
        } catch (createErr) {
          console.error(
            `Error creating ${model.modelName} "${name}":`,
            createErr
          );
          if (createErr.code === 11000) {
            // Attempt to refetch if duplicate error
            doc = await model.findOne({ [queryField]: name }, "_id");
          } else {
            continue; // Skip if creation failed for other reasons
          }
        }
      }
      if (doc) {
        id = doc._id;
        cacheMap.set(name, id); // Cache using the original name for lookup consistency
      } else {
        console.warn(
          `Warning: Could not find or create document with ${queryField}="${name}" in ${model.modelName} collection.`
        );
      }
    }
    if (id) {
      ids.push(id);
    }
  }
  return ids;
}

// --- Function to Create Variants for a Package ---
async function createVariantsForPackage(packageId, variants, venueId) {
  const variantIds = [];

  for (const variantData of variants) {
    try {
      // Check if variant with same name already exists for this package
      const existingVariant = await Variant.findOne({
        name: variantData.name,
        packageId: packageId,
      });

      if (existingVariant) {
        console.log(
          `Variant "${variantData.name}" already exists for package ${packageId}. Updating...`
        );

        // Update existing variant
        const updatedVariant = await Variant.findByIdAndUpdate(
          existingVariant._id,
          {
            description: variantData.description,
            minPersons: variantData.minPersons,
            maxPersons: variantData.maxPersons,
            cost: variantData.cost,
          },
          { new: true }
        );

        variantIds.push(updatedVariant._id);
        console.log(
          `Updated variant: ${updatedVariant.name} (ID: ${updatedVariant._id})`
        );
      } else {
        // Create new variant
        const newVariant = new Variant({
          name: variantData.name,
          description: variantData.description,
          packageId: packageId,
          minPersons: variantData.minPersons,
          maxPersons: variantData.maxPersons,
          cost: variantData.cost,
          createdBy: venueId,
          isCustomized: false,
          // Initialize empty arrays for fields that are arrays in your schema
          menuItems: [],
          paidServices: [],
          freeServices: [],
          availableMenuCount: [],
        });

        const savedVariant = await newVariant.save();
        variantIds.push(savedVariant._id);
        console.log(
          `Created variant: ${savedVariant.name} (ID: ${savedVariant._id})`
        );
      }
    } catch (error) {
      console.error(
        `Error creating/updating variant "${variantData.name}":`,
        error
      );
    }
  }

  return variantIds;
}

// --- Main Seeding Function ---
async function seedVenuePackages(targetVenueId) {
  const eventTypeIdsCache = new Map();

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: dbName });
    console.log("Connected successfully to MongoDB.");

    // 1. Validate the target Venue exists
    console.log(`Validating Venue ID: ${targetVenueId}...`);
    const venue = await Venue.findById(targetVenueId, "_id").lean();
    if (!venue) {
      throw new Error(`Venue with ID ${targetVenueId} not found.`);
    }
    console.log(`Venue ${targetVenueId} found.`);

    // 2. Ensure Event Types Exist (and cache their IDs)
    console.log("Ensuring necessary Event Types exist...");
    const allEventTypeNames = [
      ...new Set(
        packagesToSeedForVenue.flatMap((p) => p.eventTypeNames).filter(Boolean)
      ),
    ];
    await getIdsFromNames(
      EventType,
      allEventTypeNames,
      eventTypeIdsCache,
      true
    );
    console.log("Event Type check complete.");

    // 3. Seed Packages for the specific venue
    console.log(`Seeding Packages for Venue ID: ${targetVenueId}...`);
    let createdPackageCount = 0;
    let updatedPackageCount = 0;
    let createdVariantCount = 0;
    let updatedVariantCount = 0;

    for (const pkgData of packagesToSeedForVenue) {
      const resolvedEventTypeIds = await getIdsFromNames(
        EventType,
        pkgData.eventTypeNames || [],
        eventTypeIdsCache
      );

      // Filter by name AND venueId to ensure package name is unique per venue
      const filter = { name: pkgData.name, venueId: targetVenueId };
      const update = {
        $set: {
          // Update fields if found
          description: pkgData.description,
          eventType: resolvedEventTypeIds,
        },
        $setOnInsert: {
          // Set only on insert
          name: pkgData.name,
          venueId: targetVenueId,
          variants: [], // Initialize as empty array
        },
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      try {
        const result = await Package.findOneAndUpdate(filter, update, options);
        if (result) {
          const isNew =
            Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) <
            1000;
          console.log(
            `${
              isNew ? "Created" : "Updated"
            } Package for Venue ${targetVenueId}: Name='${result.name}' (ID: ${
              result._id
            })`
          );
          if (isNew) createdPackageCount++;
          else updatedPackageCount++;

          // Now create variants for this package
          console.log(
            `Creating/updating variants for package: ${result.name} (ID: ${result._id})...`
          );

          // Create variants for the package
          const variantIds = await createVariantsForPackage(
            result._id,
            pkgData.variants,
            targetVenueId
          );

          // Update package with variant IDs if any were created
          if (variantIds.length > 0) {
            // Update the package with the new variant IDs
            await Package.findByIdAndUpdate(result._id, {
              variants: variantIds,
            });
            console.log(
              `Updated package ${result.name} with ${variantIds.length} variants`
            );
          }
        } else {
          console.warn(
            `Could not verify Package upsert for Venue ${targetVenueId}: Name='${pkgData.name}'`
          );
        }
      } catch (err) {
        if (err.code === 11000) {
          console.warn(
            `Package "${pkgData.name}" for Venue ${targetVenueId} likely already exists (duplicate key error). Skipping.`
          );
        } else {
          console.error(
            `Error upserting package "${pkgData.name}" for Venue ${targetVenueId}:`,
            err
          );
        }
      }
    }

    console.log(`Finished seeding Packages for Venue ${targetVenueId}.`);
    console.log(
      `Packages - Created: ${createdPackageCount}, Updated: ${updatedPackageCount}`
    );
  } catch (err) {
    console.error(
      "\n--- An error occurred during the Venue Specific Package seeding process ---"
    );
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

// --- Run the script with the provided Venue ID ---
const venueObjectId = new ObjectId(venueIdString);
seedVenuePackages(venueObjectId);
