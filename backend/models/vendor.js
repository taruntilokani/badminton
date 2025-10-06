// Vendor Schema
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  shopName: String,
  password: { type: String, required: true },
  role: { type: String, default: 'vendor' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', vendorSchema);
