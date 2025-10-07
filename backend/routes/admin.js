const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order = require('../models/order');

// Admin registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ adminId: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Admin login error:', err); // Log the full error for debugging
    res.status(500).json({ error: 'An unexpected error occurred during login. Please check server logs.' });
  }
});

// Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin Orders Report
 * Returns per-order times and status for display on admin console.
 */
router.get('/orders-report', async (req, res) => {
  try {
    const orders = await Order.find().lean();

    const report = orders.map((o) => {
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

      return {
        orderId: o._id,
        customerId: o.customerId,
        vendorId: o.vendorId,
        riderId: o.riderId,
        status: o.status,
        pickupAddress: o.pickupAddress,
        deliveryAddress: o.deliveryAddress,
        serviceTimerStart: o.serviceTimerStart,
        customerCompletionTime: o.customerCompletionTime,
        riderPickupOtp: o.riderPickupOtp,
        riderDeliveryToVendorOtp: o.riderDeliveryToVendorOtp,
        vendorHandoverToRiderOtp: o.vendorHandoverToRiderOtp,
        customerReturnOtp: o.customerReturnOtp,
        totalRiderTime: Number(isFinite(totalRider) ? totalRider.toFixed(2) : 0),
        totalVendorTime: Number(isFinite(totalVendor) ? totalVendor.toFixed(2) : 0),
        totalServiceTime: totalService != null && isFinite(totalService) ? Number(totalService.toFixed(2)) : null,
        racketDetails: o.racketDetails,
        quoteAmount: o.quoteAmount,
        price: o.price,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Single Order Metrics
 * Detailed breakdown for one service.
 */
router.get('/orders/:id/metrics', async (req, res) => {
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

    const metrics = {
      orderId: o._id,
      status: o.status,
      timestamps: {
        serviceTimerStart: o.serviceTimerStart,
        riderPickupStartTime: o.riderPickupStartTime,
        riderDeliveryToVendorTime: o.riderDeliveryToVendorTime,
        vendorServiceStartTime: o.vendorServiceStartTime,
        vendorServiceEndTime: o.vendorServiceEndTime,
        riderReturnToCourtTime: o.riderReturnToCourtTime,
        customerCompletionTime: o.customerCompletionTime
      },
      durationsMinutes: {
        riderPickupDuration: Number(isFinite(riderPickupDuration) ? riderPickupDuration.toFixed(2) : 0),
        riderReturnDuration: Number(isFinite(riderReturnDuration) ? riderReturnDuration.toFixed(2) : 0),
        vendorDuration: Number(isFinite(vendorDuration) ? vendorDuration.toFixed(2) : 0),
        totalRiderTime: Number(isFinite(totalRider) ? totalRider.toFixed(2) : 0),
        totalVendorTime: Number(isFinite(totalVendor) ? totalVendor.toFixed(2) : 0),
        totalServiceTime: totalService != null && isFinite(totalService) ? Number(totalService.toFixed(2)) : null
      }
    };

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
