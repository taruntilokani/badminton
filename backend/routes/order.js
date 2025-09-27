const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const otpService = require('../../customer_backend/services/otpService'); // Adjust path as needed
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
  },
});

// Create order
router.post('/', upload.single('racketImage'), async (req, res) => {
  try {
    // req.body will now be populated by multer for text fields
    // req.file will contain the uploaded file information
    const order = new Order(req.body);
    order.serviceTimerStart = new Date(); // Start customer service timer

    if (req.file) {
      order.racketImage = `/uploads/${req.file.filename}`; // Save the path of the uploaded image
    }

    // Generate OTP for rider pickup
    const riderPickupOtp = otpService.generateOTP();
    order.riderPickupOtp = riderPickupOtp;

    await order.save();

    // Simulate notification to rider and vendor
    console.log(`[NOTIFICATION] To Rider ${order.riderId}: New order ${order._id} submitted by customer ${order.customerId}. Please pick up at ${order.pickupAddress}. OTP for pickup: ${riderPickupOtp}`);
    console.log(`[NOTIFICATION] To Vendor ${order.vendorId}: New order ${order._id} has been submitted. Racket will be delivered by rider.`);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rider picks up racket
router.post('/:id/pickup', async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.riderPickupOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    order.status = 'picked';
    order.riderPickupStartTime = new Date(); // Rider time starts

    // Generate OTP for delivery to vendor
    const riderDeliveryToVendorOtp = otpService.generateOTP();
    order.riderDeliveryToVendorOtp = riderDeliveryToVendorOtp; // Correctly assign to riderDeliveryToVendorOtp

    await order.save();

    console.log(`[NOTIFICATION] To Vendor ${order.vendorId}: Racket for order ${order._id} is en route. Rider will deliver with OTP: ${riderDeliveryToVendorOtp}`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider delivers racket to vendor
router.post('/:id/deliver-to-vendor', async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body; // OTP to confirm delivery to vendor

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.riderDeliveryToVendorOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP for vendor delivery' });
    }

    order.status = 'in-progress';
    order.riderDeliveryToVendorTime = new Date(); // Rider time pauses
    order.vendorServiceStartTime = new Date(); // Vendor time starts
    await order.save();

    console.log(`[NOTIFICATION] To Customer ${order.customerId}: Your racket for order ${order._id} has been delivered to the vendor. Service is now in progress.`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor completes service
router.post('/:id/service-complete', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.vendorServiceEndTime = new Date(); // Vendor time stops
    // Rider time resumes from vendorServiceEndTime; final end time will be set on return-to-court

    // Calculate total vendor time in minutes
    const vendorServiceDuration = (order.vendorServiceEndTime - order.vendorServiceStartTime) / (1000 * 60);
    order.totalVendorTime = vendorServiceDuration;

    // Calculate total rider time (pickup to delivery to vendor)
    const riderPickupDuration = (order.riderDeliveryToVendorTime - order.riderPickupStartTime) / (1000 * 60);
    // We will add the return trip time later when the rider delivers back to court.
    // For now, we'll just store the pickup duration.
    // order.totalRiderTime = riderPickupDuration; // This will be updated later

    // Update status to indicate service is done and ready for return delivery
    order.status = 'ready-for-delivery'; // A new status might be needed

    // Generate OTP for customer pickup and rider return confirmation
    const customerReturnOtp = otpService.generateOTP();
    order.customerReturnOtp = customerReturnOtp;

    const riderReturnOtp = otpService.generateOTP();
    order.riderReturnOtp = riderReturnOtp;

    await order.save();

    console.log(`[NOTIFICATION] To Customer ${order.customerId}: Your racket for order ${order._id} is ready for delivery! Pickup OTP: ${customerReturnOtp}`);
    console.log(`[NOTIFICATION] To Rider ${order.riderId}: Racket for order ${order._id} is ready for return delivery. Use OTP: ${riderReturnOtp} to confirm return to court.`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider returns racket to court
router.post('/:id/return-to-court', async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body; // OTP to confirm delivery to customer

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.riderReturnOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    order.status = 'delivered'; // Racket delivered back to court
    order.riderReturnToCourtTime = new Date(); // Rider time ends

    // Calculate total rider time
    const riderPickupDuration = (order.riderDeliveryToVendorTime - order.riderPickupStartTime) / (1000 * 60);
    // Correcting the calculation for riderReturnDuration
    const riderReturnDurationCorrected = (order.riderReturnToCourtTime - order.vendorServiceEndTime) / (1000 * 60);

    order.totalRiderTime = riderPickupDuration + riderReturnDurationCorrected;

    await order.save();

    console.log(`[NOTIFICATION] To Customer ${order.customerId}: Your racket for order ${order._id} has been returned to the court and is ready for pickup. Please use your pickup OTP: ${order.customerReturnOtp}`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer picks up racket
router.post('/:id/customer-pickup', async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body; // OTP for customer to pick up racket

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customerReturnOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    order.status = 'completed'; // Service cycle ends
    order.customerCompletionTime = new Date();
    if (order.serviceTimerStart) {
      order.totalServiceTime = (order.customerCompletionTime - order.serviceTimerStart) / (1000 * 60);
    }

    await order.save();

    console.log(`[NOTIFICATION] To Customer ${order.customerId}: Service for order ${order._id} is now complete. Thank you!`);
    console.log(`[ADMIN CONSOLE] Order ${order._id} completed. Total Service Time: ${order.totalServiceTime} mins, Total Rider Time: ${order.totalRiderTime} mins, Total Vendor Time: ${order.totalVendorTime} mins.`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Payment initiation (stub) - marks order as paid and stores a payment reference
 */
router.post('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentReference } = req.body || {};

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.json(order); // idempotent
    }

    order.paymentReference = paymentReference || `STUB-${Date.now()}`;
    order.paymentStatus = 'paid';
    await order.save();

    // TODO: Integrate with real payment gateway, verify signature, amount, etc.
    console.log(`Payment recorded for order ${order._id}. Ref: ${order.paymentReference}`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Vendor proposes a quote
 */
router.post('/:id/quote', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body || {};
    if (amount == null) {
      return res.status(400).json({ error: 'amount is required' });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.quoteAmount = Number(amount);
    order.vendorNotes = notes || order.vendorNotes;
    order.quoteStatus = 'proposed';
    // For simplicity, align base price with proposed quote
    order.price = Number(amount);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Vendor accepts job
 */
router.post('/:id/vendor-accept', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.quoteStatus = 'accepted';
    if ((order.price == null || Number.isNaN(order.price)) && order.quoteAmount != null) {
      order.price = order.quoteAmount;
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Vendor rejects job
 */
router.post('/:id/vendor-reject', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.quoteStatus = 'rejected';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Vendor marks repair started
 */
router.post('/:id/vendor-start', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.status = 'in-progress';
    if (!order.vendorServiceStartTime) {
      order.vendorServiceStartTime = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider pickup evidence upload
router.post('/:id/pickup-evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.body.pickupEvidenceImage) {
      order.pickupEvidenceImage = req.body.pickupEvidenceImage;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider delivery to vendor evidence upload
router.post('/:id/delivery-evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.body.deliveryToVendorEvidenceImage) {
      order.deliveryToVendorEvidenceImage = req.body.deliveryToVendorEvidenceImage;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor service completion evidence upload
router.post('/:id/service-evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.body.serviceCompleteEvidenceImage) {
      order.serviceCompleteEvidenceImage = req.body.serviceCompleteEvidenceImage;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider return to court evidence upload
router.post('/:id/return-evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.body.returnToCourtEvidenceImage) {
      order.returnToCourtEvidenceImage = req.body.returnToCourtEvidenceImage;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer pickup evidence upload
router.post('/:id/customer-pickup-evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.body.customerPickupEvidenceImage) {
      order.customerPickupEvidenceImage = req.body.customerPickupEvidenceImage;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get full order detail (safe for customer tracking)
 */
router.get('/:id/detail', async (req, res) => {
  try {
    const { id } = req.params;
    const o = await Order.findById(id);
    if (!o) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(o);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Order summary for a single order (for customer/admin views)
 */
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const o = await Order.findById(id).lean();
    if (!o) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const riderPickupDuration =
      o.riderPickupStartTime && o.riderDeliveryToVendorTime
        ? (new Date(o.riderDeliveryToVendorTime) - new Date(o.riderPickupStartTime)) / (1000 * 60)
        : 0;

    const riderReturnDuration =
      o.vendorServiceEndTime && o.riderReturnToCourtTime
        ? (new Date(o.riderReturnToCourtTime) - new Date(o.vendorServiceEndTime)) / (1000 * 60)
        : 0;

    const vendorDuration =
      o.vendorServiceStartTime && o.vendorServiceEndTime
        ? (new Date(o.vendorServiceEndTime) - new Date(o.vendorServiceStartTime)) / (1000 * 60)
        : 0;

    const totalRider =
      typeof o.totalRiderTime === 'number' ? o.totalRiderTime : riderPickupDuration + riderReturnDuration;

    const totalVendor =
      typeof o.totalVendorTime === 'number' ? o.totalVendorTime : vendorDuration;

    const totalService =
      o.customerCompletionTime && o.serviceTimerStart
        ? (new Date(o.customerCompletionTime) - new Date(o.serviceTimerStart)) / (1000 * 60)
        : o.serviceTimerStart
          ? (Date.now() - new Date(o.serviceTimerStart)) / (1000 * 60)
          : null;

    const summary = {
      orderId: o._id,
      status: o.status,
      totalRiderTime: Number(isFinite(totalRider) ? totalRider.toFixed(2) : 0),
      totalVendorTime: Number(isFinite(totalVendor) ? totalVendor.toFixed(2) : 0),
      totalServiceTime: totalService != null && isFinite(totalService) ? Number(totalService.toFixed(2)) : null
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { customerId, vendorId, status } = req.query;
    const query = {};
    if (customerId) query.customerId = customerId;
    if (vendorId) query.vendorId = vendorId;
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
