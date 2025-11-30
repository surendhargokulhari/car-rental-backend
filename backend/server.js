const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Booking = require('./models/Booking');
require('dotenv').config();

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
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

mongoose.connection.on("error", err => {
  console.error("🔥 MongoDB runtime error:", err.message);
});

// ---------------------------
// Nodemailer setup
// ---------------------------
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ Email credentials missing in .env. Emails will not be sent.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ---------------------------
// Routes
// ---------------------------

// Test route
app.get('/', (req, res) => {
  res.send("🚗 Car Rental Backend is running");
});

// Booking route
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate } = req.body;

    if (!name || !email || !carModel || !phone || !pickupDate || !returnDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const booking = new Booking({ name, email, carModel, phone, pickupDate, returnDate });
    await booking.save();

    // Send email only if credentials are present
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Booking Confirmation - Go Wheels',
        html: `
          <h3>Booking Confirmed ✅</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Car Model:</strong> ${carModel}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Pickup Date:</strong> ${pickupDate}</p>
          <p><strong>Return Date:</strong> ${returnDate}</p>
          <p>Explore cars now and continue your booking!</p>
          <p><a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">Browse Available Cars</a></p>
          <br>
          <p>Best regards,<br><strong>Go Wheels Team</strong></p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ message: 'Booking confirmed & email sent', booking });

  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// ---------------------------
// Start Server
// ---------------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
