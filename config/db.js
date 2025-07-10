// config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
let db = null
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("booking").command({ ping: 1 });
    db = client.db("booking");
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized! Call connectToMongoDB first.');
    }
    return db;
}

module.exports = {run, getDb};
