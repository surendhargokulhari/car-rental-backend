const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  carModel: String,
  phone: String
}, {
  timestamps: true  // <-- this adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Booking', bookingSchema);
