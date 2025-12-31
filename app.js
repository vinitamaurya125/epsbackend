const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

const hasValidScheme =
  MONGO_URI.startsWith("mongodb://") || MONGO_URI.startsWith("mongodb+srv://");

if (!hasValidScheme) {
  console.error('Invalid MONGO_URI scheme. It must start with "mongodb://" or "mongodb+srv://".');
  console.error(`Current MONGO_URI: ${MONGO_URI}`);
  process.exit(1);
}

console.log("Attempting to connect to MongoDB Atlas...");
console.log(`Connection string: ${MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    console.log(`Connected to database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    if (err.reason) {
      console.error("Reason:", err.reason);
    }
    console.error("\n⚠️  Common solutions:");
    console.error("1. Check if your IP address is whitelisted in MongoDB Atlas");
    console.error("2. Verify your username and password are correct");
    console.error("3. Ensure your cluster is active and running");
    process.exit(1);
  });

app.use("/api/auth", require("./routes/admin.routes"));
app.use("/api/blogs", require("./routes/blog.routes"));

module.exports = app;
