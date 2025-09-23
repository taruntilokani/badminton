import React, { useState } from 'react';

// --- Styles ---
const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

// --- Components ---

// Login Form Component
function LoginForm({ setView }) {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Hardcoded test credentials for demonstration
  const TEST_USER = 'test@example.com';
  const TEST_PASS = 'test123';

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login success with hardcoded credentials
    if (contact === TEST_USER && password === TEST_PASS) {
      setView('home');
    } else {
      setError('Invalid credentials. Use test@example.com / test123');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email or WhatsApp Number</label>
        <input type="text" placeholder="Enter email or WhatsApp number" style={{ width: '100%' }} value={contact} onChange={e => setContact(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Password</label>
        <input type="password" placeholder="Enter password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>Login</button>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={() => setView('signup')}>Sign Up</button>
        <button type="button" onClick={() => setView('reset')}>Forgot Password?</button>
      </div>
    </form>
  );
}

// Sign Up Form Component
function SignUpForm({ setView }) {
  const [method, setMethod] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [contact, setContact] = useState('');
  const [userId, setUserId] = useState(null); // To store the user ID returned from backend
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappNumber: method === 'whatsapp' ? contact : '',
          email: method === 'email' ? contact : '',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId);
        setOtpSent(true);
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup OTP send error:', err);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!userId) {
      setError('User ID not found. Please try signing up again.');
      return;
    }
    try {
      const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOtpVerified(true);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during OTP verification. Please try again.');
      console.error('Signup OTP verify error:', err);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Sign Up</h3>
      <div style={{ marginBottom: 12 }}>
        <label>
          <input type="radio" checked={method === 'whatsapp'} onChange={() => { setMethod('whatsapp'); setContact(''); setOtpSent(false); setOtpVerified(false); setError(''); }} /> WhatsApp
        </label>
        <label style={{ marginLeft: 16 }}>
          <input type="radio" checked={method === 'email'} onChange={() => { setMethod('email'); setContact(''); setOtpSent(false); setOtpVerified(false); setError(''); }} /> Email
        </label>
      </div>
      {method === 'whatsapp' ? (
        <input type="text" placeholder="WhatsApp Number" style={{ width: '100%' }} value={contact} onChange={e => setContact(e.target.value)} />
      ) : (
        <input type="email" placeholder="Email Address" style={{ width: '100%' }} value={contact} onChange={e => setContact(e.target.value)} />
      )}
      {!otpSent && (
        <button type="button" style={{ marginTop: 16, width: '100%' }} onClick={handleSendOtp} disabled={!contact}>Send OTP</button>
      )}
      {otpSent && !otpVerified && (
        <div style={{ marginTop: 16 }}>
          <input type="text" placeholder="Enter OTP" style={{ width: '100%' }} value={otp} onChange={e => setOtp(e.target.value)} />
          <button type="button" style={{ marginTop: 8, width: '100%' }} onClick={handleVerifyOtp} disabled={!otp}>Verify OTP</button>
        </div>
      )}
      {otpVerified && (
        <div style={{ marginTop: 16, color: 'green' }}>OTP Verified! Account created.</div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
}

// Password Reset Form Component
function PasswordResetForm({ setView }) {
  const [method, setMethod] = useState('whatsapp');
  const [contact, setContact] = useState('');
  const [userId, setUserId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async () => {
    setError('');
    try {
      const response = await fetch('/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: contact }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId);
        setOtpSent(true);
      } else {
        setError(data.message || 'Failed to request password reset. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password reset request error:', err);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!userId) {
      setError('User ID not found. Please try requesting reset again.');
      return;
    }
    try {
      const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOtpVerified(true);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during OTP verification. Please try again.');
      console.error('Password reset OTP verify error:', err);
    }
  };

  const handleUpdatePassword = async () => {
    setError('');
    if (!userId || !newPassword) {
      setError('User ID and new password are required.');
      return;
    }
    try {
      const response = await fetch('/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordUpdated(true);
      } else {
        setError(data.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while updating password. Please try again.');
      console.error('Update password error:', err);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Reset Password</h3>
      <div style={{ marginBottom: 12 }}>
        <label>
          <input type="radio" checked={method === 'whatsapp'} onChange={() => { setMethod('whatsapp'); setContact(''); setOtpSent(false); setOtpVerified(false); setPasswordUpdated(false); setError(''); }} /> WhatsApp
        </label>
        <label style={{ marginLeft: 16 }}>
          <input type="radio" checked={method === 'email'} onChange={() => { setMethod('email'); setContact(''); setOtpSent(false); setOtpVerified(false); setPasswordUpdated(false); setError(''); }} /> Email
        </label>
      </div>
      {method === 'whatsapp' ? (
        <input type="text" placeholder="WhatsApp Number" style={{ width: '100%' }} value={contact} onChange={e => setContact(e.target.value)} />
      ) : (
        <input type="email" placeholder="Email Address" style={{ width: '100%' }} value={contact} onChange={e => setContact(e.target.value)} />
      )}
      {!otpSent && (
        <button type="button" style={{ marginTop: 16, width: '100%' }} onClick={handleRequestReset} disabled={!contact}>Send OTP</button>
      )}
      {otpSent && !otpVerified && (
        <div style={{ marginTop: 16 }}>
          <input type="text" placeholder="Enter OTP" style={{ width: '100%' }} value={otp} onChange={e => setOtp(e.target.value)} />
          <button type="button" style={{ marginTop: 8, width: '100%' }} onClick={handleVerifyOtp} disabled={!otp}>Verify OTP</button>
        </div>
      )}
      {otpVerified && !passwordUpdated && (
        <div style={{ marginTop: 16 }}>
          <input type="password" placeholder="Enter new password" style={{ width: '100%' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <button type="button" style={{ marginTop: 8, width: '100%' }} onClick={handleUpdatePassword} disabled={!newPassword}>Update Password</button>
        </div>
      )}
      {passwordUpdated && (
        <div style={{ marginTop: 16, color: 'green' }}>Password updated! You can now login.</div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
}

// Home page Component
function Home({ setView }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2>Welcome!</h2>
      <p>Start your service request or view your previous requests.</p>
      <button style={{ marginRight: 16 }} onClick={() => setView('service')}>New Request</button>
      <button onClick={() => setView('requests')}>View My Requests</button>
    </div>
  );
}

// Requests tab Component
function RequestsTab({ requestIds, setView }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3>My Requests</h3>
      {requestIds.length === 0 ? (
        <div>No requests yet.</div>
      ) : (
        <ul>
          {requestIds.map(id => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      )}
      <button style={{ marginTop: 16 }} onClick={() => setView('home')}>Back to Home</button>
    </div>
  );
}

// Service selection and request flow Component
function ServiceFlow({ setRequestId, setView, setRequestIds }) {
  const [service, setService] = useState('');
  const [option, setOption] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Placeholder for customerId. In a real app, this would come from authentication state.
  // Using valid-looking ObjectId placeholders for Mongoose validation.
  const customerId = '60d5ec49f8c7a10015a4b7c8'; // Example customer ID (valid ObjectId format)
  const vendorId = '60d5ec49f8c7a10015a4b7c9';   // Example vendor ID (valid ObjectId format)

  const serviceOptions = [
    { name: 'Badminton Racquet', options: ['Grip replacement', 'String getting', 'Racket repair'] },
    { name: 'Tennis Racquet', options: ['Grip replacement', 'String getting', 'Racket repair'] }
  ];

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service || !option) {
      setError('Please select a service and an option.');
      return;
    }
    if (!photo) {
      setError('Image is mandatory. Please upload a photo.');
      return;
    }
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('customerId', customerId);
    formData.append('vendorId', vendorId); // Use the generated valid ObjectId
    formData.append('service', service);
    formData.append('option', option);
    formData.append('racketImage', photo); // Corrected field name to match backend Multer configuration

    try {
      // Use the correct backend URL and endpoint
      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        body: formData, // Use FormData for file uploads
      });
      const data = await response.json();

      if (response.ok) {
        setRequestId(data._id); // Use data._id as per Mongoose model
        setRequestIds(prev => [...prev, data._id]); // Add new request ID to the list
        setSubmitting(false);
        setView('submitted'); // Go to submitted view
      } else {
        setError(data.message || 'Failed to submit request. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred while submitting the request. Please try again.');
      setSubmitting(false);
      console.error('Submit request error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Select Service</h3>
      <div style={{ marginBottom: 12 }}>
        {serviceOptions.map(s => (
          <label key={s.name} style={{ marginRight: 16 }}>
            <input type="radio" checked={service === s.name} onChange={() => { setService(s.name); setOption(''); }} /> {s.name}
          </label>
        ))}
      </div>
      {service && (
        <div style={{ marginBottom: 12 }}>
          <h4>Service Options</h4>
          {serviceOptions.find(s => s.name === service).options.map(opt => (
            <label key={opt} style={{ display: 'block', marginBottom: 6 }}>
              <input type="radio" checked={option === opt} onChange={() => setOption(opt)} /> {opt}
            </label>
          ))}
        </div>
      )}
      {option && (
        <div style={{ marginBottom: 12 }}>
          <h4>Upload Racket Photo</h4>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photo && <div style={{ marginTop: 8 }}>Selected: {photo.name}</div>}
        </div>
      )}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {option && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" style={{ margin: '16px auto', width: 120, fontSize: 14 }} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
        </div>
      )}
    </form>
  );
}

// Main App Component
function App() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'reset', 'service', 'home', 'requests'
  const [requestId, setRequestId] = useState(null);
  const [requestIds, setRequestIds] = useState([]);

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: font, padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 480, margin: '48px auto', background: cardBg, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}`, padding: 32, position: 'relative' }}>
        <h2 style={{ color: accent, fontWeight: 700, marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>Customer App</h2>
        {view !== 'login' && (
          <button style={{ position: 'absolute', top: 24, right: 24, background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }} onClick={() => setView('home')}>Logout</button>
        )}
        {view === 'login' && (
          <LoginForm setView={setView} />
        )}
        {view === 'signup' && (
          <SignUpForm setView={setView} />
        )}
        {view === 'reset' && (
          <PasswordResetForm setView={setView} />
        )}
        {view === 'home' && (
          <Home setView={setView} />
        )}
        {view === 'service' && (
          <ServiceFlow setRequestId={setRequestId} setView={setView} setRequestIds={setRequestIds} />
        )}
        {view === 'submitted' && requestId && (
          <div style={{ marginTop: 32, padding: 16, border: `1px solid #4caf50`, borderRadius: 12, background: '#e8f5e9', textAlign: 'center', boxShadow: '0 2px 8px rgba(76,175,80,0.08)' }}>
            <h3 style={{ color: '#388e3c', fontWeight: 700 }}>Request Submitted!</h3>
            <div style={{ fontSize: 16, margin: '12px 0' }}>Request ID: <b>{requestId}</b></div>
            <div style={{ marginTop: 8, color: '#388e3c' }}>You will receive your request ID on WhatsApp and Email.</div>
            <button style={{ marginTop: 16, background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setView('home')}>Go to Home</button>
          </div>
        )}
        {view === 'requests' && (
          <RequestsTab requestIds={requestIds} setView={setView} />
        )}
      </div>
    </div>
  );
}

export default App;
