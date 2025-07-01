const { MongoClient, ObjectId } = require("mongodb");

// MONGODB_URL=mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging

// MongoDB connection URI
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging"; // change to your DB
const collectionName = "restaurants"; // change if needed

// Dummy base64 image placeholder (use real ones later)
const placeholderImage =
  "https://img.freepik.com/free-psd/delicious-spaghetti-dish-with-fresh-ingredients-pan-with-transparent-background_84443-25952.jpg?semt=ais_hybrid&w=740";

// --- New Code: City to State Mapping ---
const cityToState = {
  Mumbai: "Maharashtra",
  "Delhi-NCR": "Delhi", // Using Delhi for NCR
  Bengaluru: "Karnataka",
  Hyderabad: "Telangana",
  Chandigarh: "Chandigarh", // Union Territory
  Ahmedabad: "Gujarat",
  Pune: "Maharashtra",
  Chennai: "Tamil Nadu",
  Kolkata: "West Bengal",
  Kochi: "Kerala",
  Ludhiana: "Punjab",
  Amritsar: "Punjab",
  Jalandhar: "Punjab",
  Patiala: "Punjab",
  Bathinda: "Punjab",
  Mohali: "Punjab",
  Hoshiarpur: "Punjab",
  Pathankot: "Punjab",
  Moga: "Punjab",
  Firozpur: "Punjab",
};

// --- New Code: Default Values ---
const defaultPhoneNumber = 1234567890; // Placeholder
const defaultEmail = "info@example.com"; // Slightly more realistic default
const defaultStreetAddress = "Phase 5, Mohali"; // Default Mohali address

// --- New Code: Helper for Random Coordinates around Mohali (Approx. 30.7046° N, 76.7179° E) ---
const mohaliCenter = { lat: 30.7046, lon: 76.7179 };

function getRandomCoordinates(radiusKm) {
  const earthRadiusKm = 6371;
  const radiusRad = radiusKm / earthRadiusKm;
  const centerLatRad = mohaliCenter.lat * (Math.PI / 180);
  const centerLonRad = mohaliCenter.lon * (Math.PI / 180);

  // Generate random distance and angle
  const randomDist = Math.random() * radiusRad;
  const randomAngle = Math.random() * 2 * Math.PI;

  // Calculate new latitude
  const newLatRad = Math.asin(
    Math.sin(centerLatRad) * Math.cos(randomDist) +
      Math.cos(centerLatRad) * Math.sin(randomDist) * Math.cos(randomAngle)
  );

  // Calculate new longitude
  const newLonRad =
    centerLonRad +
    Math.atan2(
      Math.sin(randomAngle) * Math.sin(randomDist) * Math.cos(centerLatRad),
      Math.cos(randomDist) - Math.sin(centerLatRad) * Math.sin(newLatRad)
    );

  // Convert back to degrees
  const newLat = newLatRad * (180 / Math.PI);
  const newLon = newLonRad * (180 / Math.PI);

  return {
    lt: parseFloat(newLat.toFixed(6)),
    lg: parseFloat(newLon.toFixed(6)),
  };
}

// --- New Code: Slug Generation Function ---
function generateSlug(name) {
  // Updated regex to handle apostrophes correctly and ensure valid slugs
  return name
    .toLowerCase()
    .replace(/['’]/g, "") // Remove apostrophes
    .replace(/[^a-z0-9\s]+/g, "") // Remove other non-alphanumeric/space chars
    .trim() // Trim leading/trailing spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/(^-|-$)+/g, ""); // Remove leading/trailing hyphens
}

// Restaurant data - FOCUSED ONLY ON MOHALI
const restaurantsInput = [
  // --- MOHALI DATA - EXPANDED TO 15+ RESTAURANTS WITH SPECIFIED RADII ---
  {
    city: "Chandigarh",
    data: [
      // --- Radius: 5 km ---
      {
        name: "Indian Coffee House",
        description: "Casual Dining - South Indian, North Indian",
        image: "https://source.unsplash.com/featured/?coffeehouse,chandigarh",
        phoneNumber: 9988776655,
        streetAddress: "Sector 17 Plaza (Example)",
        location: getRandomCoordinates(5),
      },
      {
        name: "Backpackers Cafe",
        description: "Cafe - Continental, Italian",
        image: "https://source.unsplash.com/featured/?cafe,chandigarh",
        phoneNumber: 9988776656,
        streetAddress: "Sector 9 Market (Example)",
        location: getRandomCoordinates(5),
      },
      // --- Radius: 10 km ---
      {
        name: "Virgin Courtyard",
        description: "Fine Dining - Italian, Mediterranean",
        image: "https://source.unsplash.com/featured/?italian,chandigarh",
        phoneNumber: 9988776657,
        streetAddress: "Sector 7C (Example)",
        location: getRandomCoordinates(10),
      },
      {
        name: "Swagath Restaurant & Bar",
        description: "Casual Dining - Seafood, South Indian",
        image: "https://source.unsplash.com/featured/?seafood,chandigarh",
        phoneNumber: 9988776658,
        streetAddress: "Sector 26 (Example)",
        location: getRandomCoordinates(10),
      },
      // --- Radius: 20 km ---
      {
        name: "Gopal Sweets",
        description: "Sweet Shop, Quick Bites - Mithai, North Indian",
        image: "https://source.unsplash.com/featured/?sweets,chandigarh",
        phoneNumber: 9988776659,
        streetAddress: "Sector 35 Market (Example)",
        location: getRandomCoordinates(20),
      },
      {
        name: "Whistling Duck",
        description: "Fine Dining - Modern Indian, Continental",
        image: "https://source.unsplash.com/featured/?fine-dining,chandigarh",
        phoneNumber: 9988776660,
        streetAddress: "Sector 26 Madhya Marg (Example)",
        location: getRandomCoordinates(20),
      },
    ],
  },

  // REMOVED OTHER CITIES
];

// Remove the console log for the original data format
// console.log("Restaurants seeded:", restaurants);

async function insertRestaurants() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // --- New Code: Transform Data ---
    const restaurantsToInsert = [];
    let restaurantCounter = 10000; // Starting counter for unique URL part

    restaurantsInput.forEach((cityData) => {
      const state = cityToState[cityData.city] || "Unknown State"; // Default if city not mapped
      const district = cityData.city; // Use city as district for simplicity

      cityData.data.forEach((restaurant) => {
        const slug = generateSlug(restaurant.name);
        const uniqueUrlPart = `${slug}-${restaurantCounter++}`; // Create a unique part for the URL

        // --- Create object matching RestaurantModels.js schema ---
        const restaurantDoc = {
          _id: new ObjectId(), // Generate ObjectId here for URL generation consistency
          restaurantName: restaurant.name,
          description: restaurant.description || restaurant.name, // Use provided description or fallback to name
          state: state,
          // --- Updated Image Structure ---
          image: {
            name: `${slug}-placeholder.jpg`, // Generate a placeholder name
            url: restaurant.image, // Use the existing image URL string here
          },
          phoneNumber: restaurant.phoneNumber || defaultPhoneNumber, // Use provided or default phone
          district: district,
          email: restaurant.email || defaultEmail, // Use provided or default email
          streetAddress: restaurant.streetAddress || defaultStreetAddress, // Use provided or default address
          qrCodes: [],
          location: restaurant.location || { lt: 0, lg: 0 }, // Use provided or default location
          cgst: restaurant.cgst || 0, // Example default CGST set to 0
          sgst: restaurant.sgst || 0, // Example default SGST set to 0
          fssai: restaurant.fssai || null, // Default FSSAI
          gstin: restaurant.gstin || null, // Default GSTIN
          tin: restaurant.tin || null, // Default TIN
          paymentFirst:
            restaurant.paymentFirst !== undefined
              ? restaurant.paymentFirst
              : false,
          paymentUPI: restaurant.paymentUPI || "",
          waivedOffReasons: [],
          active: true,
          inActiveTime: null,
        };
        // Pre-generate the URL that the pre-save hook *would* generate (for logging/consistency)
        // Note: This mimics the logic but doesn't use the counter, pre-save hook handles uniqueness
        const nameSlug = restaurant.name.toLowerCase().split(/\s+/).join("-");
        restaurantDoc.url = `/restaurant/${nameSlug}-TEMP`; // Actual URL generated by pre-save hook

        restaurantsToInsert.push(restaurantDoc);
      });
    });

    // Clear existing data in the collection before inserting (optional, be careful!)
    // console.log("Clearing existing restaurant data...");
    // await collection.deleteMany({});

    console.log(
      `Attempting to insert ${restaurantsToInsert.length} restaurants with new format.`
    );
    // Insert the transformed data
    const result = await collection.insertMany(restaurantsToInsert);
    console.log(
      `${result.insertedCount} restaurants inserted with the new format.`
    );

    // Log a sample of the inserted data structure
    if (result.insertedCount > 0) {
      const firstInserted = await collection.findOne({
        _id: result.insertedIds[0],
      });
      console.log(
        "Sample inserted document structure:",
        JSON.stringify(firstInserted, null, 2)
      );

      // --- Optional: Update restaurantURL with actual ID --- NO LONGER NEEDED (URL generated by pre-save)
      /*
        // console.log("Updating restaurant URLs with actual IDs...");
        // const updates = [];
        // for (const id of Object.values(result.insertedIds)) {
        //     updates.push({
        //         updateOne: {
        //             filter: { _id: id },
        //             // Corrected template literal for update
        //             update: { $set: { restaurantURL: `https://menuapp.sensationsolutions.in/?restaurantId=${id.toString()}&tableNumber=` } }
        //         }
        //     });
        // }
        // if (updates.length > 0) {
        //     await collection.bulkWrite(updates);
        //     console.log("Restaurant URLs updated.");
        // }
        */
    }
  } catch (err) {
    console.error("Error inserting restaurants:", err);
  } finally {
    await client.close();
  }
}

insertRestaurants();
