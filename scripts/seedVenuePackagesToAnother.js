#!/usr/bin/env node

/**
 * Enhanced script to clone packages, variants, restaurant menus, and restaurant services
 * from one venue to another
 *
 * Usage: node clone-packages.js <sourceVenueId> <targetVenueId>
 *
 * Example: node clone-packages.js 6473e2a80e8f456a14d13a4c 6473f79a0e8f456a14d13a4e
 */

const mongoose = require("mongoose");
const Package = require("../modules/venue/models/package.model");
const Variant = require("../modules/venue/models/variant.model");
const restaurantMenuModel = require("../modules/venue/models/restaurantMenu.model");
const restaurantServicesModal = require("../modules/venue/models/restaurantServices.modal");
const { ObjectId } = mongoose.Types;
require("dotenv").config();
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging";
// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Clone packages and variants from source venue to target venue
 *
 * @param {string} sourceVenueId - Source venue ID
 * @param {string} targetVenueId - Target venue ID
 */
async function clonePackagesAndVariants(sourceVenueId, targetVenueId) {
  try {
    console.log(
      `Cloning packages and variants from venue ${sourceVenueId} to venue ${targetVenueId}`
    );

    // Find all packages for the source venue
    const sourcePackages = await Package.find({
      venueId: new ObjectId(sourceVenueId),
    });

    console.log(`Found ${sourcePackages.length} source packages to clone`);

    // Map to track old package IDs to new package IDs
    const packageIdMap = new Map();

    // Create new packages for the target venue
    const newPackages = [];
    for (const sourcePackage of sourcePackages) {
      // Create a new package object without _id so MongoDB generates a new one
      const packageData = sourcePackage.toObject();
      delete packageData._id;

      // Update venueId to the target venue
      packageData.venueId = new ObjectId(targetVenueId);

      // Create and save the new package
      const newPackage = new Package(packageData);
      await newPackage.save();

      // Map old package ID to new package ID
      packageIdMap.set(sourcePackage._id.toString(), newPackage._id);
      newPackages.push(newPackage);

      console.log(
        `Cloned package: ${sourcePackage.name} (${sourcePackage._id} -> ${newPackage._id})`
      );
    }

    console.log(`Successfully created ${newPackages.length} new packages`);

    // Find all variants for source packages
    let totalVariantsCloned = 0;
    for (const sourcePackage of sourcePackages) {
      const sourceVariants = await Variant.find({
        packageId: sourcePackage._id,
      });

      console.log(
        `Found ${sourceVariants.length} variants for package ${sourcePackage.name}`
      );

      // Get the new package ID for this source package
      const newPackageId = packageIdMap.get(sourcePackage._id.toString());

      // Clone variants
      for (const sourceVariant of sourceVariants) {
        const variantData = sourceVariant.toObject();
        delete variantData._id;

        // Update packageId to the new package ID
        variantData.packageId = newPackageId;

        // Create and save the new variant
        const newVariant = new Variant(variantData);
        await newVariant.save();

        totalVariantsCloned++;
        console.log(
          `Cloned variant: ${sourceVariant.name} (${sourceVariant._id} -> ${newVariant._id})`
        );
      }
    }

    console.log(`Successfully cloned ${totalVariantsCloned} variants`);
    console.log("Package and Variant clone operation completed successfully");

    return {
      packagesCount: newPackages.length,
      variantsCount: totalVariantsCloned,
      packageIdMap,
    };
  } catch (error) {
    console.error("Error cloning packages and variants:", error);
    throw error;
  }
}

/**
 * Clone restaurant menus from source venue to target venue
 *
 * @param {string} sourceVenueId - Source venue ID
 * @param {string} targetVenueId - Target venue ID
 */
async function cloneRestaurantMenus(sourceVenueId, targetVenueId) {
  try {
    console.log(
      `Cloning restaurant menus from venue ${sourceVenueId} to venue ${targetVenueId}`
    );

    // Find the source venue's restaurant ID
    const sourceRestaurantMenu = await restaurantMenuModel.findOne({
      restaurantId: new ObjectId(sourceVenueId),
    });

    if (!sourceRestaurantMenu) {
      console.log(`No restaurant menu found for source venue ${sourceVenueId}`);
      return { menusCount: 0 };
    }

    const sourceRestaurantId = sourceRestaurantMenu.restaurantId;

    // Find all restaurant menus for the source restaurant
    const sourceMenus = await restaurantMenuModel.find({
      restaurantId: sourceRestaurantId,
    });

    console.log(`Found ${sourceMenus.length} source restaurant menus to clone`);

    // Check if menus already exist for the target venue to avoid duplicates
    const existingTargetMenu = await restaurantMenuModel.findOne({
      restaurantId: new ObjectId(targetVenueId),
    });

    if (existingTargetMenu) {
      console.log(
        `Restaurant menus already exist for target venue ${targetVenueId}. Skipping menu clone.`
      );
      return { menusCount: 0, skipped: true };
    }

    // Clone menus
    let menusCloned = 0;
    for (const sourceMenu of sourceMenus) {
      const menuData = sourceMenu.toObject();
      delete menuData._id;

      // Update venueId to the target venue
      menuData.restaurantId = new ObjectId(targetVenueId);

      // Create and save the new menu
      const newMenu = new restaurantMenuModel(menuData);
      await newMenu.save();

      menusCloned++;
      console.log(
        `Cloned restaurant menu: ${sourceMenu._id} -> ${newMenu._id}`
      );
    }

    console.log(`Successfully cloned ${menusCloned} restaurant menus`);
    return { menusCount: menusCloned };
  } catch (error) {
    console.error("Error cloning restaurant menus:", error);
    throw error;
  }
}

/**
 * Clone restaurant services from source venue to target venue
 *
 * @param {string} sourceVenueId - Source venue ID
 * @param {string} targetVenueId - Target venue ID
 */
async function cloneRestaurantServices(sourceVenueId, targetVenueId) {
  try {
    console.log(
      `Cloning restaurant services from venue ${sourceVenueId} to venue ${targetVenueId}`
    );

    // Find the source venue's restaurant ID
    const sourceRestaurantService = await restaurantServicesModal.findOne({
      restaurantId: new ObjectId(sourceVenueId),
    });

    if (!sourceRestaurantService) {
      console.log(
        `No restaurant service found for source venue ${sourceVenueId}`
      );
      return { servicesCount: 0 };
    }

    const sourceRestaurantId = sourceRestaurantService.restaurantId;

    // Find all restaurant services for the source restaurant
    const sourceServices = await restaurantServicesModal.find({
      restaurantId: sourceRestaurantId,
    });

    console.log(
      `Found ${sourceServices.length} source restaurant services to clone`
    );

    // Check if services already exist for the target venue to avoid duplicates
    const existingTargetService = await restaurantServicesModal.findOne({
      restaurantId: new ObjectId(targetVenueId),
    });

    if (existingTargetService) {
      console.log(
        `Restaurant services already exist for target venue ${targetVenueId}. Skipping service clone.`
      );
      return { servicesCount: 0, skipped: true };
    }

    // Clone services
    let servicesCloned = 0;
    for (const sourceService of sourceServices) {
      const serviceData = sourceService.toObject();
      delete serviceData._id;

      // Update venueId to the target venue
      serviceData.restaurantId = new ObjectId(targetVenueId);

      // Create and save the new service
      const newService = new restaurantServicesModal(serviceData);
      await newService.save();

      servicesCloned++;
      console.log(
        `Cloned restaurant service: ${sourceService._id} -> ${newService._id}`
      );
    }

    console.log(`Successfully cloned ${servicesCloned} restaurant services`);
    return { servicesCount: servicesCloned };
  } catch (error) {
    console.error("Error cloning restaurant services:", error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 2) {
      console.error(
        "Usage: node clone-packages.js <sourceVenueId> <targetVenueId>"
      );
      process.exit(1);
    }

    const sourceVenueId = args[0];
    const targetVenueId = args[1];

    // Validate IDs
    if (!ObjectId.isValid(sourceVenueId) || !ObjectId.isValid(targetVenueId)) {
      console.error(
        "Error: Invalid venue ID format. Please provide valid MongoDB ObjectIds."
      );
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();

    // Clone packages and variants
    const packagesResult = await clonePackagesAndVariants(
      sourceVenueId,
      targetVenueId
    );

    // Clone restaurant menus
    const menusResult = await cloneRestaurantMenus(
      sourceVenueId,
      targetVenueId
    );

    // Clone restaurant services
    const servicesResult = await cloneRestaurantServices(
      sourceVenueId,
      targetVenueId
    );

    console.log("\nSummary:");
    console.log(`- Source Venue ID: ${sourceVenueId}`);
    console.log(`- Target Venue ID: ${targetVenueId}`);
    console.log(`- Packages Cloned: ${packagesResult.packagesCount}`);
    console.log(`- Variants Cloned: ${packagesResult.variantsCount}`);
    console.log(
      `- Restaurant Menus Cloned: ${menusResult.menusCount}${
        menusResult.skipped ? " (skipped - already exist)" : ""
      }`
    );
    console.log(
      `- Restaurant Services Cloned: ${servicesResult.servicesCount}${
        servicesResult.skipped ? " (skipped - already exist)" : ""
      }`
    );

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("An error occurred:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
main();
