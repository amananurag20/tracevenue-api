const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const User = require("../models/User"); // Adjust path if necessary
const { USER_TYPES } = require("../constants"); // Adjust path if necessary

// --- Configuration ---
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";
const saltRounds = 10; // Cost factor for bcrypt hashing
const standardPassword = "12345678"; // Common password for all venue users

// --- README Content Generation (Fixed Template Literal Structure) ---
const readmeHeader = `# Restaurant Management API - Seeding Information

This document provides details on how to seed the database and the credentials for the created venue users.

## Prerequisites

- Node.js (Check package.json for recommended version, e.g., v22.4.1)
- npm
- MongoDB instance (update connection URI in scripts if needed)

## Setup

1. Clone the repository.
2. Navigate to the project directory: \`cd TraceVenue-API\`
3. Install dependencies: \`npm install\`

## Seeding Steps

1.  **Seed Restaurants:**
    -   Run the script: \`node scripts/addRestautant.js\`
    -   This will populate the \`restaurants\` collection with sample data.

2.  **Seed Users and Associate with Restaurants:**
    -   Run the script: \`node scripts/associateUserToRestaurant.js\`
    -   This creates a user for each venue, with each user associated with exactly one venue.

## Venue User Credentials

The following venue users have been created. You can use their email and password to log in.

**Important Security Note:** Passwords listed here are for initial setup and testing ONLY. In a real application, NEVER store or expose plain text passwords. The script hashes passwords before storing them in the database.

| User Name   | Email              | Password    | Associated Venue (Name) | Associated Venue (ID) |
|-------------|--------------------|-------------|-------------------------|------------------------|
`;
let readmeTableContent = ""; // Separate variable for table rows

async function associateUsers() {
  try {
    console.log("Connecting to MongoDB...");
    // Use mongoose.connect which manages the connection pool
    await mongoose.connect(uri, { dbName: dbName });
    console.log("Connected successfully to MongoDB.");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const restaurantsCollection = db.collection("restaurants");

    console.log("Fetching all restaurants...");
    // Fetch all restaurants
    const restaurants = await restaurantsCollection
      .find({})
      .project({ _id: 1, restaurantName: 1 })
      .toArray();

    if (restaurants.length === 0) {
      console.error(
        "Cannot proceed without restaurants. Run addRestautant.js first."
      );
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${restaurants.length} restaurants to create users for.`);

    // Get all existing users with venue pattern emails to determine next available number
    const existingVenueUsers = await usersCollection
      .find({
        email: /^venue\d+@example\.com$/,
      })
      .toArray();

    // Extract all venue numbers from existing emails
    const usedVenueNumbers = existingVenueUsers.map((user) => {
      const match = user.email.match(/^venue(\d+)@example\.com$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    // Also get all venues that are already associated with users
    const alreadyAssociatedVenues = new Set();
    existingVenueUsers.forEach((user) => {
      if (user.associatedWith && Array.isArray(user.associatedWith)) {
        user.associatedWith.forEach((venueId) => {
          alreadyAssociatedVenues.add(venueId.toString());
        });
      }
    });

    console.log(`Found ${existingVenueUsers.length} existing venue users.`);
    console.log(
      `Found ${alreadyAssociatedVenues.size} venues already associated with users.`
    );

    // Start with venue1 if none exist, otherwise use next available number
    let nextVenueNumber = 1;
    if (usedVenueNumbers.length > 0) {
      nextVenueNumber = Math.max(...usedVenueNumbers) + 1;
    }

    console.log("Creating users for unassociated venues...");
    const createdUserDetails = []; // To store details for README

    // Process each restaurant
    for (const restaurant of restaurants) {
      const restaurantId = restaurant._id.toString();

      // Skip if this venue is already associated with a user
      if (alreadyAssociatedVenues.has(restaurantId)) {
        console.log(
          `Skipping restaurant ${restaurant.restaurantName} (${restaurantId}) - already has a user.`
        );
        continue;
      }

      // Generate user details for this venue
      const venueEmail = `venue${nextVenueNumber}@example.com`;
      const venueName = `${restaurant.restaurantName} Admin`;

      try {
        const hashedPassword = await bcrypt.hash(standardPassword, saltRounds);
        console.log(
          `Creating user for venue #${nextVenueNumber}: ${restaurant.restaurantName}`
        );

        const newUser = new User({
          userName: venueName,
          email: venueEmail,
          password: hashedPassword,
          role: USER_TYPES.restaurant,
          isVerified: true,
          isApproved: true,
          approvalStatus: "approved",
          phoneNumber: `123${nextVenueNumber.toString().padStart(7, "0")}`,
          associatedWith: [restaurantId], // Associate with only this restaurant ID
        });

        const savedUser = await newUser.save();
        console.log(
          `Created user: ${savedUser.email} associated with restaurant: ${restaurant.restaurantName}`
        );

        createdUserDetails.push({
          userName: venueName,
          email: venueEmail,
          password: standardPassword,
          associatedRestaurant: restaurant.restaurantName,
          associatedId: restaurantId,
        });

        // Increment for next venue
        nextVenueNumber++;
      } catch (saveError) {
        if (saveError.code === 11000) {
          console.warn(
            `User with email ${venueEmail} potentially created concurrently or already exists. Skipping.`
          );
          nextVenueNumber++; // Still need to increment to avoid duplicates
        } else {
          console.error(
            `Error creating user for ${restaurant.restaurantName}:`,
            saveError
          );
        }
      }
    }

    // --- Add existing venue users to the README for completeness ---
    for (const existingUser of existingVenueUsers) {
      // For each existing user, find their associated venue to include in the README
      if (
        existingUser.associatedWith &&
        existingUser.associatedWith.length > 0
      ) {
        const venueId = existingUser.associatedWith[0].toString();
        const venueInfo = restaurants.find((r) => r._id.toString() === venueId);

        if (venueInfo) {
          createdUserDetails.push({
            userName: existingUser.userName,
            email: existingUser.email,
            password: "(previously set)",
            associatedRestaurant: venueInfo.restaurantName,
            associatedId: venueId,
          });
        }
      }
    }

    // --- Finalize README ---
    createdUserDetails.forEach((detail) => {
      // Add row to the table content string
      readmeTableContent += `| ${detail.userName.padEnd(
        11
      )} | ${detail.email.padEnd(18)} | ${detail.password.padEnd(
        11
      )} | ${detail.associatedRestaurant.padEnd(23)} | ${
        detail.associatedId
      } |\n`;
    });

    // Combine header and table content
    const finalReadmeContent = readmeHeader + readmeTableContent;

    const readmePath = path.join(__dirname, "..", "README.md"); // Place README in the root directory
    fs.writeFileSync(readmePath, finalReadmeContent);
    console.log(`README.md generated/updated successfully at ${readmePath}`);
    console.log(
      `Created ${createdUserDetails.length} venue users (${
        existingVenueUsers.length
      } existing, ${
        createdUserDetails.length - existingVenueUsers.length
      } new).`
    );
  } catch (err) {
    console.error(
      "An error occurred during the user association process:",
      err
    );
  } finally {
    // Close the Mongoose connection
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

// --- Run the script ---
associateUsers();
