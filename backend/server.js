const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Booking = require('./models/Booking'); // <-- Your model
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/car_booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// POST booking
// Example Express.js endpoint
app.post("/api/book", (req, res) => {
  const { name, email, carModel, phone } = req.body;

  if (!name || !email || !carModel || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // You can log to confirm:
  console.log("Booking received:", req.body);

  // Simulate saving to DB
  res.status(200).json({ message: "Booking successful!" });
});


// GET all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚗 Server running at http://localhost:${PORT}`);
});
