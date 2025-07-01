const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// --- Model Imports ---
// Adjust path if necessary
const User = require('../models/User.js'); // Assuming path for User model

// --- Configuration ---
const uri = "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- IDs ---
const sourceIdString = "6819c5412a237da760268b67";
const targetIdString = "6818aa96a591b0a1cc22270b";

// --- Main Function ---
async function changeUserId() {
  let session;
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected successfully to MongoDB.');

    session = await mongoose.startSession();
    console.log('Starting transaction...');
    session.startTransaction();

    const sourceId = new ObjectId(sourceIdString);
    const targetId = new ObjectId(targetIdString);

    // 1. Find the original document (NOT using lean initially)
    console.log(`Finding user with source ID: ${sourceIdString}...`);
    const originalUser = await User.findById(sourceId).session(session);

    if (!originalUser) {
      throw new Error(`User with source ID ${sourceIdString} not found.`);
    }
    const originalEmail = originalUser.email; // Store the correct email
    console.log(`Found user: ${originalEmail}`);

    // 2. Check if target ID already exists
    console.log(`Checking if target ID ${targetIdString} already exists...`);
    const existingTargetUser = await User.findById(targetId).lean().session(session); // lean is fine here
    if (existingTargetUser) {
      throw new Error(`A user with the target ID ${targetIdString} already exists (${existingTargetUser.email}). Aborting.`);
    }
    console.log('Target ID is available.');

    // 3. Temporarily update the original user's email to avoid unique constraint violation
    const temporaryEmail = `${originalEmail}_temp_change_${Date.now()}`;
    console.log(`Temporarily updating original user's email to: ${temporaryEmail}...`);
    originalUser.email = temporaryEmail;
    await originalUser.save({ session }); // Save the change within the transaction
    console.log('Original user email temporarily updated.');

    // 4. Prepare the new document data using original values
    console.log('Preparing new user document...');
    // Use .toObject() or manually copy fields if needed, ensure _id is handled
    const originalUserDocData = originalUser.toObject(); // Get data after temp update, but we'll fix email
    const newUserDocData = { ...originalUserDocData }; // Copy fields
    delete newUserDocData._id;      // Remove temporary _id (or sourceId)
    delete newUserDocData.email;    // Remove temporary email
    newUserDocData._id = targetId;  // Assign the new target _id
    newUserDocData.email = originalEmail; // Assign the CORRECT original email
    // Ensure timestamps are handled correctly if needed, or let Mongoose defaults work
    // delete newUserDocData.createdAt; // Optionally remove if you want new timestamps
    // delete newUserDocData.updatedAt;

    // 5. Create the new document with the target ID and ORIGINAL email
    console.log(`Creating new user with target ID ${targetIdString} and email ${originalEmail}...`);
    const usersCollection = mongoose.connection.db.collection('users');
    const insertResult = await usersCollection.insertOne(newUserDocData, { session });
    if (!insertResult.insertedId || insertResult.insertedId.toString() !== targetIdString) {
        throw new Error('Failed to insert new user document with the specified target ID.');
    }
    console.log(`Successfully created new user document with ID: ${insertResult.insertedId}`);

    // 6. Delete the original document (which now has the temporary email)
    console.log(`Deleting original user (with temp email) - source ID ${sourceIdString}...`);
    // Use deleteOne with the original ID
    const deleteResult = await User.deleteOne({ _id: sourceId }).session(session);
    if (deleteResult.deletedCount !== 1) {
        throw new Error(`Failed to delete the original user document (ID: ${sourceIdString}). Manual cleanup required.`);
    }
    console.log('Successfully deleted original user document.');

    // Commit the transaction
    await session.commitTransaction();
    console.log('Transaction committed successfully.');

  } catch (err) {
    console.error("\n--- An error occurred ---:", err.message);
    if (session && session.inTransaction()) {
        console.log('Aborting transaction...');
        await session.abortTransaction();
        console.log('Transaction aborted.');
    } else if (session){
        console.log('Session ended without active transaction.');
    }

  } finally {
    if (session) {
      await session.endSession();
      console.log('Session ended.');
    }
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// --- Run the script ---
changeUserId(); 