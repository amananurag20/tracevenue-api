require("dotenv").config();
const mongoose = require("mongoose");

const sourceUri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging";
const targetUri =
  "mongodb+srv://gurjinders1480:jNdNy8M1mrByCVyf@cluster0.ooywrrd.mongodb.net/staging";

async function cloneMongoDB() {
  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  const targetConn = await mongoose.createConnection(targetUri).asPromise();

  console.log("🔗 Connected to both source and target databases.");

  const collections = await sourceConn.db.listCollections().toArray();

  for (const { name: collectionName } of collections) {
    if (collectionName.startsWith("system.")) continue;

    const sourceCollection = sourceConn.db.collection(collectionName);
    const targetCollection = targetConn.db.collection(collectionName);

    const docs = await sourceCollection.find().toArray();

    if (docs.length === 0) {
      console.log(`⚠️  Skipping empty collection: ${collectionName}`);
      continue;
    }

    await targetCollection.insertMany(docs);
    console.log(`✅ Copied ${docs.length} documents to "${collectionName}"`);
  }

  await sourceConn.close();
  await targetConn.close();
  console.log("🎉 Clone completed and connections closed.");
}

cloneMongoDB().catch((err) => {
  console.error("❌ Error during cloning:", err);
});
