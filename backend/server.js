const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Booking = require('./models/Booking');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "https://surendhargokulhari.github.io",
    "https://surendhargokulhari.github.io/car-rental-main/"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test route
app.get('/', (req, res) => {
  res.send("🚗 Car Rental Backend is running");
});

// Booking route
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate } = req.body;
    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const booking = new Booking({ name, email, carModel, phone, pickupDate, returnDate });
    await booking.save();

    // Email booking details
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Booking Confirmation - Go Wheels',
      html: `
        <h3>Booking Confirmed ✅</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Car Model:</strong> ${carModel}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Pickup:</strong> ${pickupDate}</p>
        <p><strong>Return:</strong> ${returnDate}</p>
        <p><strong>Return:</strong> ${paymentMethod}</p>
        <p>Thank you for booking with Go Wheels!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Booking confirmed & email sent' });
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
