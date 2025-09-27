const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const Order = require('../models/order');

// Create vendor
router.post('/', async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Vendor earnings summary
 * Returns totals derived from orders linked to this vendor.
 */
router.get('/:id/earnings', async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await Order.find({ vendorId: id });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.price || 0), 0);
    const outstandingToCollect = orders
      .filter((o) => o.paymentStatus !== 'paid')
      .reduce((sum, o) => sum + (o.price || 0), 0);

    res.json({
      vendorId: id,
      totalOrders,
      completedOrders,
      paidOrders,
      totalRevenue,
      outstandingToCollect
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
