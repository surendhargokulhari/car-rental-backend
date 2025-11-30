// send-test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  connectionTimeout: 20000
});

async function sendTest() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself for quick test
      subject: "Test Email - Go Wheels",
      text: "This is a test from your Go Wheels backend."
    });
    console.log("✅ Test email sent");
  } catch (err) {
    console.error("❌ Test email failed:", err);
  }
}

sendTest();
