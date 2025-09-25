const express = require('express');
const app = express();
app.use(express.json());

let allRequests = [];

// Admin gets all requests
app.get('/all-requests', (req, res) => {
  res.json(allRequests);
});

// Update request status and times
app.post('/update-request', (req, res) => {
  const { id, riderTime, vendorTime, status } = req.body;
  let reqObj = allRequests.find(r => r.id === id);
  if (!reqObj) {
    reqObj = { id, riderTime, vendorTime, status };
    allRequests.push(reqObj);
  } else {
    reqObj.riderTime = riderTime;
    reqObj.vendorTime = vendorTime;
    reqObj.status = status;
  }
  res.json({ success: true });
});

app.listen(5004, () => console.log('Admin backend running on port 5004'));
