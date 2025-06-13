const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Booking = require('./models/Booking'); // Make sure this path is correct

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://car-rental-three-rho.vercel.app'], // Allow Vercel frontend
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://root:<db_password>@cluster1.nbwi64w.mongodb.net/car_booking?retryWrites=true&w=majority&appName=Cluster1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});

// Test route
app.get('/', (req, res) => {
  res.send('🚗 Car Rental Backend is running!');
});

// Booking API
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
