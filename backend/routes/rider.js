const express = require('express');
const router = express.Router();
const Rider = require('../models/rider');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Rider registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, vehicle, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const rider = new Rider({ name, email, phone, vehicle, password: hashedPassword, role: 'rider' });
    await rider.save();
    res.status(201).json({ message: 'Rider created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rider login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const rider = await Rider.findOne({ email });
    if (!rider) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, rider.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ riderId: rider._id, role: rider.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
    res.json({ token, rider: { _id: rider._id, name: rider.name, email: rider.email, role: rider.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all riders
router.get('/', async (req, res) => {
  try {
    const riders = await Rider.find();
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
