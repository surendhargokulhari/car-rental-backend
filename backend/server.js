const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Booking = require('./models/Booking'); // Make sure this path is correct
require('dotenv').config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// ✅ CORS Fix: Allow Vercel Frontend

app.use(cors({
  origin: [
    "https://surendhargokulhari.github.io",  // ✅ allow GitHub Pages
    "https://surendhargokulhari.github.io/car-rental-main/" // ✅ allow Vercel frontend
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));


app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// Test route
app.get('/', (req, res) => {
  res.send('🚗 Car Rental Backend is running!');
});

// ✅ Store booking
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone } = req.body;

    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newBooking = new Booking({ name, email, carModel, phone });
    await newBooking.save();

    res.status(200).json({ message: 'Booking successful' });
  } catch (error) {
    console.error('❌ Booking error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Optional: Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
