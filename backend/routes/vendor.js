const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Vendor registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address, shopName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const vendor = new Vendor({ name, email, phone, address, shopName, password: hashedPassword, role: 'vendor' });
    await vendor.save();
    res.status(201).json({ message: 'Vendor created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vendor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ vendorId: vendor._id, role: vendor.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
    res.json({ token, vendor: { _id: vendor._id, name: vendor.name, email: vendor.email, role: vendor.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
