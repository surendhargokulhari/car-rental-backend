const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "https://surendhargokulhari.github.io",
    "https://surendhargokulhari.github.io/car-rental-main/"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));


// -------------------------------
// GMAIL APP PASSWORD TRANSPORTER
// -------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",   // works better on Render
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail
    pass: process.env.EMAIL_PASS    // 16-digit App Password
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
      return res.status(400).json({ message: 'Name, email, car model, and phone are required.' });
    }

    const pickup = pickupDate ? new Date(pickupDate) : null;
    const ret = returnDate ? new Date(returnDate) : null;

    const booking = new Booking({
      name,
      email,
      carModel,
      phone,
      pickupDate: pickup,
      returnDate: ret
    });

    await booking.save();

    // Email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Booking Confirmation - Go Wheels',
        html: `
          <h3>Booking Confirmed ✅</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Car Model:</strong> ${carModel}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Pickup Date:</strong> ${pickup ? pickup.toDateString() : 'N/A'}</p>
          <p><strong>Return Date:</strong> ${ret ? ret.toDateString() : 'N/A'}</p>
          <br>
          <p><a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">Browse Available Cars</a></p>
          <br>
          <p>Best regards,<br><strong>Go Wheels Team</strong></p>
        `
      });

      console.log("✅ Email sent to:", email);

    } catch (emailErr) {
      console.warn("⚠️ Email failed:", emailErr.message);
    }

    res.status(200).json({ message: 'Booking confirmed', booking });

  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));