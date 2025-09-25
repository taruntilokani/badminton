// Racket Repair Order Schema
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  status: { type: String, enum: ['pending', 'picked', 'in-progress', 'ready-for-delivery', 'delivered', 'completed'], default: 'pending' },
  pickupAddress: String,
  deliveryAddress: String,
  racketDetails: String,
  price: Number,
  serviceTimerStart: { type: Date },
  riderPickupStartTime: { type: Date },
  riderPickupOtp: { type: String },
  riderDeliveryToVendorOtp: { type: String }, // Added for delivery to vendor
  riderDeliveryToVendorTime: { type: Date },
  pickupEvidenceImage: String, // Evidence for rider pickup
  deliveryToVendorEvidenceImage: String, // Evidence for delivery to vendor
  serviceCompleteEvidenceImage: String, // Evidence for vendor service completion
  returnToCourtEvidenceImage: String, // Evidence for rider return to court
  customerPickupEvidenceImage: String, // Evidence for customer pickup
  vendorServiceStartTime: { type: Date },
  vendorServiceEndTime: { type: Date },
  riderReturnToCourtTime: { type: Date },
  riderReturnOtp: { type: String },
  totalRiderTime: { type: Number },
  totalVendorTime: { type: Number },
  customerReturnOtp: { type: String },
  customerCompletionTime: { type: Date },
  totalServiceTime: { type: Number },
  racketImage: String, // To store the path to the uploaded image
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
