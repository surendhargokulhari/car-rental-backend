// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({
  origin: [
    "https://surendhargokulhari.github.io",
    "https://surendhargokulhari.github.io/car-rental-main/"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// ---------------------------
// MongoDB Connection
// ---------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// ---------------------------
// SMTP Transporter (Gmail)
// ---------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Gmail App Password
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("📧 SMTP Server is Ready to Send Emails");
  }
});

// ---------------------------
// Test Route
// ---------------------------
app.get('/', (req, res) => {
  res.send("🚗 Car Rental Backend is running");
});

// ---------------------------
// Booking Route
// ---------------------------
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate } = req.body;

    // Validation
    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const pickup = pickupDate ? new Date(pickupDate) : null;
    const ret = returnDate ? new Date(returnDate) : null;

    // Save booking to database
    const booking = new Booking({
      name,
      email,
      carModel,
      phone,
      pickupDate: pickup,
      returnDate: ret
    });

    await booking.save();

    // Send booking confirmation email
    const mailOptions = {
      from: `"Go Wheels" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Booking Confirmation - Go Wheels",
      html: `
        <h2>Booking Confirmed! 🚗</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Car Model:</strong> ${carModel}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Pickup Date:</strong> ${pickup ? pickup.toDateString() : 'N/A'}</p>
        <p><strong>Return Date:</strong> ${ret ? ret.toDateString() : 'N/A'}</p>

        <p>You can browse available cars here:</p>
        <a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">
          Browse Cars
        </a>

        <br><br>
        <p>Thank you,<br><strong>Go Wheels Team</strong></p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Email sent to:", email);
    } catch (emailErr) {
      console.log("⚠️ Email Sending Failed:", emailErr.message);
    }

    res.status(200).json({
      message: "Booking saved. Email sent (if SMTP allowed).",
      booking
    });

  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// ---------------------------
// Start Server
// ---------------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
