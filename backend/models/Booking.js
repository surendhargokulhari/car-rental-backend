const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  carModel: String,
  phone: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
