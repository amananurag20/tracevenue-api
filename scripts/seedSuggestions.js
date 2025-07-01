const mongoose = require("mongoose");

// --- Model Imports ---
// Adjust paths if necessary
const Suggestion = require("../modules/venue/models/suggestions.model.js");
// EventType and Cuisine models no longer needed for this simplified seeding
// const EventType = require('../modules/venue/models/events.model.js');
// const Cuisine = require('../modules/venue/models/cuisine.model.js');

// --- Configuration ---
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Suggestions to Seed (Simplified: only keyword) ---
const suggestionsToSeed = [
  {
    keyword:
      "Kitty party for 70 with continental and chinese and italian cuisine",
  },
  { keyword: "Art exhibition with food mediterranean for 40 to 70 people" },
  {
    keyword:
      "Naming ceremony (naamkaran) for 30 people with thai and mediterranean and mexican cuisine",
  },
  {
    keyword:
      "Anniversary celebration with food thai and italian and indian for 90",
  },
  { keyword: "Naming ceremony (naamkaran) indian and chinese 130" },
  { keyword: "Art exhibition with food thai for 140 people" },
  { keyword: "Thread ceremony (upanayanam) with food chinese for 240 people" },
  { keyword: "Music concert mediterranean 400" },
  { keyword: "Naming ceremony (naamkaran) chinese and italian 400 people" },
  { keyword: "Silver jubilee anniversary with food thai and indian for 720" },
  { keyword: "Corporate conference chinese 420 people" },
  { keyword: "Reception party indian 300 people" },
  { keyword: "New year's eve party for 300 people with italian cuisine" },
  { keyword: "Music concert japanese and thai 350 people" },
  {
    keyword:
      "Corporate conference for 240 people with mexican and chinese and italian cuisine",
  },
  { keyword: "Birthday party for 500 people with thai cuisine" },
  { keyword: "Birthday party for 50 people with thai cuisine" },
  { keyword: "Wedding ceremony mediterranean 300 people" },
  { keyword: "Naming ceremony (naamkaran) thai and indian 200 people" },
  { keyword: "Movie premiere mexican 100 people" },
  {
    keyword:
      "Corporate conference with food italian and indian and mexican for 135 people",
  },
  { keyword: "Naming ceremony (naamkaran) for 45 people with mexican cuisine" },
  {
    keyword:
      "Graduation party for 120 with continental and mexican and italian cuisine",
  },
  {
    keyword:
      "Product launch mediterranean and thai and continental 30 to 70 people",
  },
  {
    keyword:
      "Music concert for 60 people with mexican and japanese and italian cuisine",
  },
  { keyword: "Conference for 90 people with thai cuisine" },
  { keyword: "Music concert for 50 with indian cuisine" },
  { keyword: "Graduation party with food japanese and indian for 400 people" },
  { keyword: "Reunion continental 40 people" },
  { keyword: "Food festival with food thai and indian for 60" },
  { keyword: "Social gathering for 220 people with italian cuisine" },
  {
    keyword:
      "Graduation party with food chinese and indian and mediterranean for 75",
  },
  { keyword: "Reunion for 38 people with mexican and indian cuisine" },
  { keyword: "Conference with food indian for 260 people" },
  { keyword: "Charity run with food continental and thai for 200 people" },
  { keyword: "Corporate event continental and chinese 60 people" },
  { keyword: "Social gathering for 140 with italian cuisine" },
  {
    keyword:
      "Retirement party pack japanese and continental and chinese 90 people",
  },
  { keyword: "Family reunion with food indian for 200 people" },
  { keyword: "Product launch for 500 people with thai cuisine" },
  {
    keyword:
      "Product launch for 365 people with italian and japanese and indian cuisine",
  },
  {
    keyword:
      "Engagement ceremony for 40 people with italian and chinese cuisine",
  },
  { keyword: "Baby shower with food italian and thai for 40 people" },
  {
    keyword:
      "Naming ceremony (naamkaran) with food japanese and thai for 250 people",
  },
  {
    keyword:
      "Movie premiere with food japanese and mexican and chinese for 300 people",
  },
  { keyword: "Baby shower with food japanese and mexican for 170 people" },
  { keyword: "Corporate event japanese and indian and chinese 270 people" },
  { keyword: "Social gathering with food continental for 140" },
  {
    keyword:
      "Silver jubilee anniversary with food continental and mediterranean for 100",
  },
  { keyword: "Reunion for 250 people with chinese cuisine" },
  {
    keyword:
      "Engagement ceremony for 540 people with indian and mexican cuisine",
  },
  { keyword: "Corporate conference with food mexican for 50 people" },
  { keyword: "Music concert for 250 people with indian cuisine" },
  {
    keyword:
      "Food festival for 240 people with mediterranean and indian and japanese cuisine",
  },
  { keyword: "Wedding ceremony with food japanese and thai for 90 people" },
  {
    keyword:
      "Housewarming ceremony (griha pravesh) with food mediterranean and italian and thai for 50 people",
  },
  { keyword: "Music concert chinese 240 people" },
  {
    keyword:
      "Birthday party for 100 people with thai and japanese and indian cuisine",
  },
  { keyword: "Social gathering continental and mexican and chinese 60 people" },
  {
    keyword:
      "Silver jubilee anniversary chinese and mexican and japanese 500-600 people",
  },
  {
    keyword:
      "Retirement party pack japanese and chinese and mediterranean 80-90 people",
  },
  {
    keyword:
      "Social gathering for 110 with mexican and chinese and continental cuisine",
  },
  { keyword: "Social gathering chinese 320 people" },
  { keyword: "New year's eve party for 90 with chinese cuisine" },
  { keyword: "Wedding reception italian and chinese 40 people" },
  { keyword: "Kitty party japanese and mexican 100 people" },
  { keyword: "Kitty party japanese and mexican 50 people" },
  { keyword: "Silver jubilee anniversary mexican 40-250 people" },
  { keyword: "Kitty party continental and indian 60 people" },
  { keyword: "Corporate conference continental 20 people" },
  { keyword: "Retirement party continental 80 people" },
  { keyword: "Farewell party mediterranean and continental 30 people" },
  {
    keyword:
      "Silver jubilee anniversary mexican and mediterranean and chinese 150 people",
  },
  { keyword: "Conference with food mexican and continental for 370 people" },
  {
    keyword:
      "Corporate conference with food japanese and mediterranean and continental for 120 people",
  },
  { keyword: "Graduation party for 70 people with indian cuisine" },
  { keyword: "Engagement ceremony for 60 people with mexican cuisine" },
  {
    keyword:
      "Silver jubilee anniversary japanese and italian and mexican 140-160 people",
  },
  {
    keyword:
      "Retirement party pack mediterranean and indian and mexican 100-110 people",
  },
  { keyword: "New year's eve party japanese 400 people" },
  {
    keyword:
      "Housewarming ceremony (griha pravesh) with food mexican and mediterranean and italian for 140 people",
  },
  { keyword: "Reunion thai 40 people" },
  { keyword: "Baby shower with food mediterranean for 22 people" },
  { keyword: "Family reunion japanese and thai and mexican 22 people" },
  {
    keyword:
      "Retirement party with food mexican and mediterranean and continental for 50 people",
  },
  { keyword: "Baby shower mediterranean 50 people" },
  { keyword: "Engagement ceremony japanese 244 people" },
  { keyword: "Kitty party mediterranean 392 people" },
  { keyword: "Art exhibition mediterranean 450 people" },
  {
    keyword:
      "Art exhibition with food indian and mediterranean and mexican for 200 people",
  },
  { keyword: "New year's eve party thai 280 people" },
  { keyword: "Reunion with food japanese for 314 people" },
  { keyword: "Wedding reception indian and italian 56 people" },
  {
    keyword:
      "Engagement ceremony for 48 people with japanese and chinese cuisine",
  },
  { keyword: "Food festival with food japanese and italian for 148 people" },
  { keyword: "Movie premiere for 96 people with japanese cuisine" },
  { keyword: "Food festival for 98 with thai and mediterranean cuisine" },
  { keyword: "Retirement party with food mexican for 80 people" },
  { keyword: "Social gathering with food indian for 44 people" },
  {
    keyword:
      "Naming ceremony (naamkaran) with food mexican and mediterranean and thai for 132",
  },
  { keyword: "Anniversary celebration with food thai for 190 people" },
];

// --- Main Seeding Function (Simplified) ---
async function seedSuggestions() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: dbName });
    console.log("Connected successfully to MongoDB.");

    // No need to ensure EventTypes or fetch Cuisines for this version

    // --- Seed Suggestions ---
    console.log("Seeding Suggestions (Keyword Only)...");
    let createdCount = 0;
    let updatedCount = 0;

    for (const suggestionData of suggestionsToSeed) {
      // Upsert the suggestion based only on keyword
      const filter = { keyword: suggestionData.keyword };
      const update = {
        $set: {
          // Set cuisines to empty array, ensure keyword exists
          keyword: suggestionData.keyword, // Explicitly set keyword for update case
          cuisines: [], // Set cuisines to empty array as per example
          // eventType is omitted
        },
        // No $setOnInsert needed as $set covers the keyword
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };

      try {
        const result = await Suggestion.findOneAndUpdate(
          filter,
          update,
          options
        );
        if (result) {
          // --- Updated Check for Timestamps ---
          let status = "Upserted"; // Default status
          let isNew = false;
          // Check if timestamps exist before comparing
          if (result.createdAt && result.updatedAt) {
            isNew =
              Math.abs(
                result.createdAt.getTime() - result.updatedAt.getTime()
              ) < 1000;
            status = isNew ? "Created" : "Updated";
          } else {
            // If timestamps are missing, log a generic upsert message
            console.warn(
              `Timestamps missing on returned result for Keyword='${result.keyword}'. Logging as 'Upserted'.`
            );
          }

          console.log(`${status} Suggestion: Keyword='${result.keyword}'`);

          // Increment counts based on the determined status
          if (isNew) {
            createdCount++;
          } else {
            // Increment updatedCount if it wasn't clearly new or if timestamps were missing (assume update)
            updatedCount++;
          }
          // --- End Updated Check ---
        } else {
          console.warn(
            `Could not verify Suggestion upsert: Keyword='${suggestionData.keyword}'`
          );
        }
      } catch (err) {
        if (err.code === 11000) {
          // This might happen if keyword isn't unique and upsert races, though filter should prevent it.
          console.warn(
            `Suggestion with keyword "${suggestionData.keyword}" likely already exists (duplicate key error). Skipping.`
          );
        } else {
          console.error(
            `Error upserting suggestion "${suggestionData.keyword}":`,
            err
          );
        }
      }
    }

    console.log(
      `Finished seeding Suggestions. Created: ${createdCount}, Updated: ${updatedCount}.`
    );
  } catch (err) {
    console.error(
      "An error occurred during the Suggestion seeding process:",
      err
    );
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

// --- Run the script ---
seedSuggestions();
