// Rider Schema
const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  vehicle: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rider', riderSchema);