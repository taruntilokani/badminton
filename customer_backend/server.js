const express = require('express');
const app = express();

// Import multer for file uploads
const multer = require('multer');
const path = require('path'); // Required for path manipulation

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the 'uploads' directory exists
    const uploadDir = path.join(__dirname, 'uploads');
    // In a real Docker setup, you might want to use a volume for uploads
    // For simplicity here, we assume the directory is created or handled by the container setup.
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Use express.json() middleware AFTER multer if you need to parse JSON bodies alongside files
// However, for file uploads, express.json() might not be needed for the /request route if using FormData
// If you need JSON parsing for other routes, keep it. For /request, multer handles the body parsing for file fields.
// For routes that don't involve files, express.json() is fine.
// Let's keep it for general use, but be mindful of order if issues arise.
app.use(express.json());

// Import otpService
const { generateOTP, verifyOTP } = require('./services/otpService');

// In-memory storage for users and requests (replace with a database in a real application)
let users = [];
let requests = []; // Structure updated for timestamps and status

// --- Helper Functions for Notifications ---
// In a real application, these would use actual SMS/Email services.
const sendNotification = (message) => {
  console.log('NOTIFICATION:', message);
};

// --- User Authentication and OTP ---

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { whatsappNumber, email } = req.body;

  // Basic validation
  if (!whatsappNumber || !email) {
    return res.status(400).json({ message: 'WhatsApp number and email are required.' });
  }

  // Check if user already exists
  if (users.find(user => user.whatsappNumber === whatsappNumber || user.email === email)) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const otp = generateOTP();
  // Simulate sending OTP via WhatsApp and Email
  sendNotification(`OTP for signup to ${whatsappNumber} (${email}): ${otp}`);

  const newUser = {
    id: 'USER' + Math.floor(Math.random() * 1000000),
    whatsappNumber,
    email,
    isWhatsappVerified: false,
    isEmailVerified: false,
    otp: otp, // Store OTP temporarily for verification
    otpExpiry: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
  };
  users.push(newUser);

  res.status(201).json({ message: 'OTP sent to your WhatsApp and email. Please verify.', userId: newUser.id });
});

// Verify OTP for signup or password reset
app.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (verifyOTP(otp, user.otp)) {
    // Mark as verified - this logic needs to be more granular for phone vs email
    // For simplicity, we'll mark both as verified if OTP matches.
    // In a real app, you'd have separate verification states.
    user.isWhatsappVerified = true;
    user.isEmailVerified = true;
    user.otp = null; // Clear OTP after successful verification
    user.otpExpiry = null;
    res.json({ success: true, message: 'OTP verified successfully.' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }
});

// Request password reset
app.post('/request-password-reset', async (req, res) => {
  const { identifier } = req.body; // Can be whatsappNumber or email

  const user = users.find(u => u.whatsappNumber === identifier || u.email === identifier);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const otp = generateOTP();
  // Simulate sending OTP via WhatsApp or Email
  const notificationMessage = user.whatsappNumber
    ? `OTP for password reset to ${user.whatsappNumber}: ${otp}`
    : `OTP for password reset to ${user.email}: ${otp}`;
  sendNotification(notificationMessage);

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  res.json({ message: 'Password reset OTP sent. Please verify.', userId: user.id });
});

// Update password after OTP verification
app.post('/update-password', async (req, res) => {
  const { userId, newPassword } = req.body;

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // In a real app, you'd hash the password before storing
  user.password = newPassword; // Storing plain text for simplicity, NOT recommended for production
  user.otp = null;
  user.otpExpiry = null;

  res.json({ success: true, message: 'Password updated successfully.' });
});


// --- Request Management ---

// Create new request (modified to handle file upload and initial timestamps)
app.post('/request', upload.single('photo'), (req, res) => {
  const { customerId, service, option } = req.body;
  const photo = req.file; // req.file contains info about the uploaded file

  // Ensure customer is verified before allowing request creation
  const customer = users.find(u => u.id === customerId);
  if (!customer || !customer.isWhatsappVerified || !customer.isEmailVerified) {
      return res.status(403).json({ message: 'Customer account not verified. Please complete signup or verify your account.' });
  }

  if (!photo) {
      return res.status(400).json({ message: 'Photo upload failed. Please ensure a file is uploaded.' });
  }

  const id = 'REQ' + Math.floor(Math.random() * 1000000);
  const customerDropoffTime = new Date(); // Timestamp for customer drop-off

  requests.push({
    id,
    customerId,
    service,
    option,
    photo: photo.filename,
    status: 'Submitted', // Initial status
    customerDropoffTime: customerDropoffTime.toISOString(), // Store as ISO string
    riderPickupTime: null,
    riderDeliveryToVendorTime: null,
    vendorProcessingStartTime: null,
    vendorReadyForDeliveryTime: null,
    vendorDeliveryTime: null,
    riderFinalDeliveryTime: null,
    pickupOTP: generateOTP(), // OTP for rider pickup
    deliveryOTP: null, // OTP for vendor delivery
  });

  // Simulate sending notifications to vendor and rider
  const customerNotification = `Your request ${id} has been submitted. You will receive updates via WhatsApp and Email.`;
  sendNotification(customerNotification);

  const vendorNotification = `New service request ${id} for ${service} - ${option}. Customer: ${customer.whatsappNumber || customer.email}.`;
  sendNotification(vendorNotification);

  const riderNotification = `New pickup request ${id} for ${service} - ${option}. Please pick up racket from customer ${customerId}.`;
  sendNotification(riderNotification);

  res.json({ id, message: 'Request submitted successfully.', pickupOTP: requests.find(r => r.id === id).pickupOTP });
});

// Endpoint to handle rider pickup and OTP verification
app.post('/rider/pickup', (req, res) => {
  const { requestId, otp } = req.body;

  const request = requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  if (request.status !== 'Submitted') {
    return res.status(400).json({ message: `Request is not in 'Submitted' state. Current state: ${request.status}` });
  }

  if (verifyOTP(otp, request.pickupOTP)) {
    request.riderPickupTime = new Date().toISOString();
    request.status = 'PickedUp';
    sendNotification(`Rider picked up request ${requestId}. Rider time started.`);
    res.json({ success: true, message: 'Rider pickup verified. Rider time started.' });
  } else {
    res.status(400).json({ message: 'Invalid OTP for pickup.' });
  }
});

// Endpoint to handle rider delivery to vendor and OTP verification
app.post('/rider/deliver-to-vendor', (req, res) => {
  const { requestId, otp } = req.body;

  const request = requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  if (request.status !== 'PickedUp') {
    return res.status(400).json({ message: `Request is not in 'PickedUp' state. Current state: ${request.status}` });
  }

  // Assuming vendor generates a delivery OTP for the rider to confirm delivery to vendor
  // For simplicity, we'll use a placeholder or assume vendor provides it.
  // In a real scenario, this OTP would be generated by the vendor system.
  // Let's assume for now the rider provides an OTP that the vendor system would verify.
  // This part needs more definition on how vendor OTP is handled.
  // For now, let's just update the status and time.

  request.riderDeliveryToVendorTime = new Date().toISOString();
  request.status = 'WithVendor'; // Rider time paused
  request.vendorProcessingStartTime = new Date().toISOString(); // Vendor time starts

  sendNotification(`Rider delivered request ${requestId} to vendor. Rider time paused. Vendor time started.`);
  res.json({ success: true, message: 'Rider delivered to vendor. Rider time paused. Vendor time started.' });
});

// Endpoint for vendor to mark racket as ready for delivery
app.post('/vendor/ready-for-delivery', (req, res) => {
  const { requestId } = req.body;

  const request = requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  if (request.status !== 'WithVendor') {
    return res.status(400).json({ message: `Request is not in 'WithVendor' state. Current state: ${request.status}` });
  }

  request.vendorReadyForDeliveryTime = new Date().toISOString();
  request.status = 'ReadyForDelivery';

  sendNotification(`Request ${requestId} is ready for delivery by vendor.`);
  res.json({ success: true, message: 'Racket marked as ready for delivery.' });
});

// Endpoint for vendor to deliver to customer (and generate delivery OTP)
app.post('/vendor/deliver', (req, res) => {
  const { requestId } = req.body;

  const request = requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  if (request.status !== 'ReadyForDelivery') {
    return res.status(400).json({ message: `Request is not in 'ReadyForDelivery' state. Current state: ${request.status}` });
  }

  request.vendorDeliveryTime = new Date().toISOString();
  request.status = 'VendorDelivered'; // Vendor time stopped
  request.deliveryOTP = generateOTP(); // Generate OTP for customer pickup

  sendNotification(`Vendor has delivered request ${requestId}. Delivery OTP: ${request.deliveryOTP}. Rider time resumes.`);
  res.json({ success: true, message: 'Racket delivered by vendor. Delivery OTP generated.', deliveryOTP: request.deliveryOTP });
});

// Endpoint for rider to make final delivery and for customer to pick up
app.post('/rider/final-delivery', (req, res) => {
  const { requestId, otp } = req.body;

  const request = requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  if (request.status !== 'VendorDelivered') {
    return res.status(400).json({ message: `Request is not in 'VendorDelivered' state. Current state: ${request.status}` });
  }

  if (verifyOTP(otp, request.deliveryOTP)) {
    request.riderFinalDeliveryTime = new Date().toISOString();
    request.status = 'Completed'; // Rider time ends

    // Calculate times
    const customerDropoff = new Date(request.customerDropoffTime);
    const riderPickup = new Date(request.riderPickupTime);
    const riderDeliveryToVendor = new Date(request.riderDeliveryToVendorTime);
    const vendorProcessingStart = new Date(request.vendorProcessingStartTime);
    const vendorReady = new Date(request.vendorReadyForDeliveryTime);
    const vendorDelivery = new Date(request.vendorDeliveryTime);
    const riderFinalDelivery = new Date(request.riderFinalDeliveryTime);

    const riderPickupToVendorTimeMs = riderDeliveryToVendor - riderPickup;
    const vendorProcessingTimeMs = vendorReady - vendorProcessingStart;
    const riderDeliveryTimeMs = riderFinalDelivery - vendorDelivery;

    const totalRiderTimeMs = (riderDeliveryToVendor - riderPickup) + (riderFinalDelivery - vendorDelivery);
    const totalVendorTimeMs = vendorReady - vendorProcessingStart;

    // Convert milliseconds to minutes for display
    const totalRiderTimeMinutes = Math.round(totalRiderTimeMs / (1000 * 60));
    const totalVendorTimeMinutes = Math.round(totalVendorTimeMs / (1000 * 60));

    sendNotification(`Rider completed final delivery for request ${requestId}. Customer notified. Total Rider Time: ${totalRiderTimeMinutes} mins. Total Vendor Time: ${totalVendorTimeMinutes} mins.`);

    res.json({
      success: true,
      message: 'Racket delivered. Service cycle complete.',
      totalRiderTimeMinutes,
      totalVendorTimeMinutes
    });
  } else {
    res.status(400).json({ message: 'Invalid OTP for final delivery.' });
  }
});

// Get a specific request by ID (for customer to view status/details)
app.get('/requests/:id', (req, res) => {
    const { id } = req.params;
    const request = requests.find(r => r.id === id);
    if (request) {
        res.json(request);
    } else {
        res.status(404).json({ message: 'Request not found.' });
    }
});

// Endpoint to get all requests (for admin console)
app.get('/requests', (req, res) => {
  res.json(requests);
});

app.listen(5001, () => console.log('Customer backend running on port 5001'));
