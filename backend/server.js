const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://surendhargokulhari.github.io",
      "https://surendhargokulhari.github.io/car-rental-main/"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));


// --------------------------------------
// 📧 EMAIL TRANSPORTER (UPDATED + FIXED)
// --------------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("📧 SMTP Server is Ready to Send Emails");
  }
});


// Test route
app.get('/', (req, res) => {
  res.send("🚗 Car Rental Backend is running");
});


// --------------------------------------
// 🚗 BOOKING ROUTE (FULLY UPDATED)
// --------------------------------------
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate } = req.body;

    // Validate fields
    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Parse dates
    const pickup = pickupDate ? new Date(pickupDate) : null;
    const ret = returnDate ? new Date(returnDate) : null;

    // Save booking to MongoDB
    const booking = new Booking({
      name,
      email,
      carModel,
      phone,
      pickupDate: pickup,
      returnDate: ret,
    });

    await booking.save();


    // --------------------------------------
    // 📧 SEND EMAIL (UPDATED)
    // --------------------------------------
    const mailOptions = {
      from: `"Go Wheels" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Booking Confirmation – Go Wheels",
      html: `
        <h2>Booking Confirmed! 🚗</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Car Model:</strong> ${carModel}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Pickup Date:</strong> ${
          pickup ? pickup.toDateString() : "N/A"
        }</p>
        <p><strong>Return Date:</strong> ${
          ret ? ret.toDateString() : "N/A"
        }</p>

        <p>You can explore more cars here:</p>
        <a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">
          View Cars
        </a>

        <br><br>
        <p>Thank you for choosing <strong>Go Wheels</strong>!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Email sent to:", email);
    } catch (emailErr) {
      console.log("⚠️ Email Sending Failed:", emailErr.message);
    }


    res.status(200).json({
      message: "Booking confirmed. Email sent (if SMTP allowed).",
      booking,
    });

  } catch (err) {
    console.log("❌ Booking Error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
