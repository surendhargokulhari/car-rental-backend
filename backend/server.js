const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI handling
let mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ MONGO_URI not found, falling back to localhost for development");
    mongoURI = 'mongodb://127.0.0.1:27017/car_booking';
  } else {
    console.error("❌ MONGO_URI not set. Aborting.");
    process.exit(1);
  }
}

// MongoDB Connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Stop server on DB connection failure
  });

// Mongoose Schema & Model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  carModel: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// POST: Book a car
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone } = req.body;

    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = new Booking({ name, email, carModel, phone });
    await booking.save();
    res.status(200).json({ message: "Booking successful!", booking });
  } catch (error) {
    console.error("❌ Error in POST /api/book:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// GET: All bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Error in GET /api/bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
