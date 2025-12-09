// -------------------------------
// IMPORTS & CONFIG
// -------------------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------------
// MIDDLEWARE
// -------------------------------
app.use(cors({
  origin: [
    "https://surendhargokulhari.github.io",
    "https://surendhargokulhari.github.io/car-rental-main"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// -------------------------------
// MONGODB CONNECTION
// -------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// -------------------------------
// NODEMAILER SETUP
// -------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -------------------------------
// DEFAULT ROUTE
// -------------------------------
app.get('/', (req, res) => {
  res.send("🚗 Car Rental Backend is running");
});

// -------------------------------
// BOOKING ROUTE
// -------------------------------
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate } = req.body;

    // Basic Validation
    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: 'Name, email, car model, and phone are required.' });
    }

    const pickup = pickupDate ? new Date(pickupDate) : null;
    const ret = returnDate ? new Date(returnDate) : null;

    if (pickup && ret && pickup > ret) {
      return res.status(400).json({ message: "Return date must be after pickup date." });
    }

    // Create Booking
    const booking = new Booking({ name, email, carModel, phone, pickupDate: pickup, returnDate: ret });
    await booking.save();

    // Send Confirmation Email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Booking Is Confirmed - Go Wheels',
        html: `
          <h2>Booking Confirmed! ✅</h2>
          <p>Thank you for booking with <strong>Go Wheels</strong>.</p>
          <h3>📄 Booking Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Car Model:</strong> ${carModel}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Pickup Date:</strong> ${pickup ? pickup.toDateString() : 'N/A'}</p>
          <p><strong>Return Date:</strong> ${ret ? ret.toDateString() : 'N/A'}</p>
          <br>
          <p>Check available cars here:</p>
          <a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">View Cars 🚘</a>
          <br><br>
          <p>Best Regards,<br><strong>Go Wheels Team</strong></p>
        `
      });
      console.log("📧 Email sent to:", email);
    } catch (emailErr) {
      console.warn("⚠ Email failed:", emailErr.message);
    }

    res.status(200).json({ message: 'Booking confirmed', booking });

  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// -------------------------------
// START SERVER
// -------------------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
