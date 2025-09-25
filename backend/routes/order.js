const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { configureMulter } = require('../../utils/imageUploadService'); // Import the generic service

// Configure multer for the initial order submission (racket photo)
const uploadRacketPhoto = configureMulter('uploads/', 'racketImage');

// Create order
router.post('/', uploadRacketPhoto, async (req, res) => { // Use the configured multer middleware
  try {
    const order = new Order(req.body);
    order.serviceTimerStart = new Date(); // Start customer service timer

    // Handle image upload
    if (req.file) {
      order.racketImage = req.file.path; // Save the path of the uploaded image
    }

    // Generate OTP for rider pickup
    // In a real application, this would use a service to generate and send OTPs (e.g., via SMS)
    const riderPickupOtp = Math.floor(100000 + Math.random() * 900000).toString();
    order.riderPickupOtp = riderPickupOtp;

    await order.save();

    // Simulate notification to rider and vendor
    console.log(`[NOTIFICATION] New order ${order._id} submitted by customer ${order.customerId}.`);
    console.log(`[NOTIFICATION] Rider ${order.riderId} notified for pickup at ${order.pickupAddress}. OTP: ${riderPickupOtp}`);
    console.log(`[NOTIFICATION] Vendor ${order.vendorId} notified about new order ${order._id}.`);

    res.status(201).json(order);
  } catch (err) {
    // If there's an error during file upload or saving, clean up the uploaded file
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error cleaning up uploaded file:', unlinkErr);
      });
    }
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
    // In a real application, this would use a service to generate and send OTPs (e.g., via SMS)
    const riderDeliveryToVendorOtp = Math.floor(100000 + Math.random() * 900000).toString();
    order.riderDeliveryToVendorOtp = riderDeliveryToVendorOtp; // Correctly assign to riderDeliveryToVendorOtp

    await order.save();

    // TODO: Implement notification service to notify vendor, and send OTP to vendor
    console.log(`Rider picked up order ${order._id}. Notifying vendor. Delivery to vendor OTP: ${riderDeliveryToVendorOtp}`);

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

    // Placeholder for OTP check if it were implemented:
    // if (order.vendorDeliveryOtp !== otp) {
    //   return res.status(400).json({ error: 'Invalid OTP for vendor delivery' });
    // }

    order.status = 'in-progress';
    order.riderDeliveryToVendorTime = new Date(); // Rider time pauses
    order.vendorServiceStartTime = new Date(); // Vendor time starts
    await order.save();

    // TODO: Implement notification service to notify customer that racket is with vendor
    console.log(`Order ${order._id} delivered to vendor. Vendor service started.`);

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
    order.riderReturnToCourtTime = new Date(); // Rider time resumes

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
    // In a real application, this would use a service to generate and send OTPs (e.g., via SMS)
    const customerReturnOtp = Math.floor(100000 + Math.random() * 900000).toString();
    order.customerReturnOtp = customerReturnOtp;

    const riderReturnOtp = Math.floor(100000 + Math.random() * 900000).toString();
    order.riderReturnOtp = riderReturnOtp;

    await order.save();

    // TODO: Implement notification service to notify customer that racket is ready for delivery and send OTP
    // TODO: Implement notification service to notify rider with return OTP
    console.log(`Order ${order._id} service completed. Vendor time: ${order.totalVendorTime} mins. Rider time resumes. Customer pickup OTP: ${customerReturnOtp}, Rider return OTP: ${riderReturnOtp}`);

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

    // TODO: Implement notification service to notify customer that racket is ready for pickup
    console.log(`Order ${order._id} returned to court. Total rider time: ${order.totalRiderTime} mins.`);

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
    // The customer's overall service time is implicitly captured by the difference
    // between order.serviceTimerStart and the current time, or a dedicated
    // customerCompletionTime field if needed. For now, we'll rely on the
    // existing timestamps and the final status.

    await order.save();

    // TODO: Implement notification service to notify customer that service is complete
    console.log(`Order ${order._id} picked up by customer. Service complete.`);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider pickup evidence upload
router.post('/:id/pickup-evidence', configureMulter('uploads/evidence/', 'pickupEvidenceImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.file) {
      order.pickupEvidenceImage = req.file.path;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider delivery to vendor evidence upload
router.post('/:id/delivery-evidence', configureMulter('uploads/evidence/', 'deliveryToVendorEvidenceImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.file) {
      order.deliveryToVendorEvidenceImage = req.file.path;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor service completion evidence upload
router.post('/:id/service-evidence', configureMulter('uploads/evidence/', 'serviceCompleteEvidenceImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.file) {
      order.serviceCompleteEvidenceImage = req.file.path;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider return to court evidence upload
router.post('/:id/return-evidence', configureMulter('uploads/evidence/', 'returnToCourtEvidenceImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.file) {
      order.returnToCourtEvidenceImage = req.file.path;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer pickup evidence upload
router.post('/:id/customer-pickup-evidence', configureMulter('uploads/evidence/', 'customerPickupEvidenceImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.file) {
      order.customerPickupEvidenceImage = req.file.path;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
