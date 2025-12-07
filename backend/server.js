const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // To read .env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection failed:", err));

// Mongoose Booking Schema & Model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  carModel: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// POST booking - Save booking to MongoDB
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
    res.status(500).json({ message: "Server error", error });
  }
});

// GET all bookings - Retrieve all bookings from MongoDB
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
