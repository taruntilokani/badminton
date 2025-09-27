// Racket Repair Order Schema
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  status: { type: String, enum: ['pending', 'picked', 'in-progress', 'ready-for-delivery', 'out-for-delivery', 'delivered', 'completed', 'vendor-completed-service-awaiting-rider-pickup'], default: 'pending' },
  pickupAddress: String,
  deliveryAddress: String,
  racketDetails: String,
  preferredPickupTime: { type: Date },
  preferredDeliveryTime: { type: Date },
  notes: String,
  quoteAmount: { type: Number },
  quoteStatus: { type: String, enum: ['none', 'proposed', 'accepted', 'rejected'], default: 'none' },
  vendorNotes: String,
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
  vendorHandoverToRiderOtp: { type: String }, // New OTP for vendor to rider handover
  totalRiderTime: { type: Number },
  totalVendorTime: { type: Number },
  customerReturnOtp: { type: String },
  customerCompletionTime: { type: Date },
  totalServiceTime: { type: Number },
  racketImage: String, // To store the path to the uploaded image
  paymentReference: String,
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
