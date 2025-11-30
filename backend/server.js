// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

// ------------------ MONGO CONNECTION ------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ------------------ EMAIL TRANSPORTER (GMAIL) ------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
});

// Check Gmail Login
transporter.verify((error) => {
  if (error) {
    console.log("❌ Gmail Login Failed:", error);
  } else {
    console.log("📨 Gmail Ready to Send Emails");
  }
});

// ------------------ MONGODB BOOKING MODEL ------------------
const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  car: String,
  pickupDate: String,
  returnDate: String,
  price: Number,
});

const Booking = mongoose.model("Booking", bookingSchema);

// ------------------ BOOKING API ------------------
app.post("/api/book", async (req, res) => {
  try {
    const { name, email, car, pickupDate, returnDate, price } = req.body;

    const booking = new Booking({
      name,
      email,
      car,
      pickupDate,
      returnDate,
      price,
    });

    await booking.save();

    // ---------------- EMAIL CONTENT ----------------
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🚗 Booking Confirmation - Go Wheels",
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your booking is successfully confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Car:</strong> ${car}</li>
          <li><strong>Pickup Date:</strong> ${pickupDate}</li>
          <li><strong>Return Date:</strong> ${returnDate}</li>
          <li><strong>Total Price:</strong> ₹${price}</li>
        </ul>
        <p>Thank you for choosing Go Wheels! 🚗💨</p>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Booking Successful & Email Sent" });
  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ success: false, message: "Booking Failed" });
  }
});

// ------------------ HOME ROUTE ------------------
app.get("/", (req, res) => {
  res.send("Go Wheels Backend Running Successfully!");
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
