const express = require('express');
const router = express.Router();
const Rider = require('../models/rider');

// Create rider
router.post('/', async (req, res) => {
  try {
    const rider = new Rider(req.body);
    await rider.save();
    res.status(201).json(rider);
  } catch (err) {
    res.status(400).json({ error: err.message });
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