// Racket Repair Order Schema
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  status: { type: String, enum: ['pending', 'picked', 'in-progress', 'completed', 'delivered'], default: 'pending' },
  pickupAddress: String,
  deliveryAddress: String,
  racketDetails: String,
  price: Number,
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);