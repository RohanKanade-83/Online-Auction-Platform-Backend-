const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routers/auth');

const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Auction API is running ✅");
});

app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);

console.log("✅ Auth routes loaded");

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL is missing in environment variables or .env file!");
}

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
