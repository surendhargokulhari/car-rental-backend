const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Booking = require('./models/Booking');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB Error:", err.message));

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

    // Save booking
    const booking = new Booking({
      name,
      email,
      carModel,
      phone,
      pickupDate: pickupDate || null,
      returnDate: returnDate || null
    });
    await booking.save();

    // Send email using SendGrid
    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Booking Confirmation - Go Wheels',
        html: `
          <h3>Booking Confirmed ✅</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Car Model:</strong> ${carModel}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Pickup Date:</strong> ${pickupDate || 'N/A'}</p>
          <p><strong>Return Date:</strong> ${returnDate || 'N/A'}</p>
          <p>Explore cars now and continue your booking!</p>
          <p><a href="https://surendhargokulhari.github.io/car-rental-main/car.html" target="_blank">Browse Available Cars</a></p>
          <br>
          <p>Best regards,<br><strong>Go Wheels Team</strong></p>
        `
      };
      await sgMail.send(msg);
      console.log("✅ Booking email sent via SendGrid");
    } catch (emailErr) {
      console.error("⚠️ SendGrid email failed:", emailErr.message);
    }

    res.status(200).json({ message: 'Booking confirmed & email attempted', booking });
  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
