const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Booking = require('./models/Booking');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: [
    "https://surendhargokulhari.github.io",
    "https://surendhargokulhari.github.io/car-rental-main/"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection failed:', err.message));

// ✅ Test Route
app.get('/', (req, res) => {
  res.send('🚗 Car Rental Backend is running!');
});

// ✅ Booking Route with Email Sending
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate, paymentMethod } = req.body;

    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save booking in MongoDB
    const newBooking = new Booking({ name, email, carModel, phone, pickupDate, returnDate, paymentMethod });
    await newBooking.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🚗 Booking Confirmed - ${carModel}`,
      html: `
        <h2>Hello ${name},</h2>
        <p>Your booking is confirmed for <strong>${carModel}</strong>.</p>
        <ul>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Pickup:</strong> ${pickupDate}</li>
          <li><strong>Return:</strong> ${returnDate}</li>
          <li><strong>Payment:</strong> ${paymentMethod}</li>
        </ul>
        <p>Thank you for choosing us!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Booking successful and email sent' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Optional: Get All Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
