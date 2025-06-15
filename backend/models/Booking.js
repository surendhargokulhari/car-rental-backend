const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  carModel: String,
  pickupDate: String,
  returnDate: String,
  paymentMethod: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
