const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  carModel: String,
  phone: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
