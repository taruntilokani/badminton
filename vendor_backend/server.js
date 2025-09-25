const express = require('express');
const app = express();
app.use(express.json());

let repairs = [];

// Vendor receives racket for repair
app.post('/repair', (req, res) => {
  const { requestId } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  repairs.push({ requestId, status: 'Waiting for vendor', otp, vendorTime: 0 });
  res.json({ requestId, otp });
});

// Verify vendor OTP
app.post('/verify-repair', (req, res) => {
  const { requestId, otp } = req.body;
  const repair = repairs.find(r => r.requestId === requestId);
  if (repair && repair.otp === otp) {
    repair.status = 'Repair started';
    repair.vendorTime = 20;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Get all repairs
app.get('/repairs', (req, res) => {
  res.json(repairs);
});

app.listen(5003, () => console.log('Vendor backend running on port 5003'));
