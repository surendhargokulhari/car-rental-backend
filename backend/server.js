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

// Database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err.message));

// ✅ Gmail App Password Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // Gmail address
    pass: process.env.EMAIL_PASS      // Gmail App Password
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Car Rental Backend Running 🚗");
});

// Booking Route
app.post("/api/book", async (req, res) => {
  try {
    const { name, email, carModel, phone, pickupDate, returnDate } = req.body;

    if (!name || !email || !carModel || !phone) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Save booking to DB
    const booking = new Booking({
      name,
      email,
      carModel,
      phone,
      pickupDate,
      returnDate
    });

    await booking.save();

    // Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation - Go Wheels",
      html: `
        <h2>Booking Confirmed 🎉</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Car Model:</strong> ${carModel}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Pickup Date:</strong> ${pickupDate}</p>
        <p><strong>Return Date:</strong> ${returnDate}</p>
        <br>
        <p>Thank you for choosing <strong>Go Wheels</strong> 🚗</p>
      `
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    console.log("Email Sent Successfully ✔️");

    res.status(200).json({ message: "Booking Confirmed & Email Sent", booking });

  } catch (err) {
    console.log("Booking Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
