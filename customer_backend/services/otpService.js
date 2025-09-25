// Placeholder for OTP generation and verification logic
// This will need to integrate with services for sending SMS (WhatsApp) and email.

const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyOTP = (userOTP, generatedOTP) => {
  return userOTP === generatedOTP;
};

module.exports = {
  generateOTP,
  verifyOTP,
};
