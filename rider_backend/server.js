const express = require('express');
const app = express();
app.use(express.json());

let pickups = [];

// Rider gets notified of new request
app.post('/pickup', (req, res) => {
  const { requestId } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pickups.push({ requestId, status: 'Waiting for pickup', otp, riderTime: 0 });
  res.json({ requestId, otp });
});

// Verify pickup OTP
app.post('/verify-pickup', (req, res) => {
  const { requestId, otp } = req.body;
  const pickup = pickups.find(p => p.requestId === requestId);
  if (pickup && pickup.otp === otp) {
    pickup.status = 'Picked up';
    pickup.riderTime = 10;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Get all pickups
app.get('/pickups', (req, res) => {
  res.json(pickups);
});

app.listen(5002, () => console.log('Rider backend running on port 5002'));
