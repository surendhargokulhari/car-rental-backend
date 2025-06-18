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
// Route to handle homepage booking email only
app.post('/api/send-booking-email', async (req, res) => {
  try {
    const { email, location, pickupDate, pickupTime, returnDate, returnTime } = req.body;

    if (!email || !location || !pickupDate || !pickupTime || !returnDate || !returnTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Go Wheels - Booking Details",
      html: `
        <h3>Search Confirmation 📝</h3>
        <p>Hi,</p>
        <p>Thanks for choosing <strong>Go Wheels</strong>.</p>
        <p>Here are your booking search details:</p>
        <ul>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Pickup:</strong> ${pickupDate} at ${pickupTime}</li>
          <li><strong>Return:</strong> ${returnDate} at ${returnTime}</li>
        </ul>
        <p>Explore cars now and continue your booking!</p>
        <p><a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">Browse Available Cars</a></p>
        <br>
        <p>Best regards,<br><strong>Go Wheels Team</strong></p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });

  } catch (err) {
    console.error("❌ Email Error:", err.message);
    res.status(500).json({ message: "Failed to send email" });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
