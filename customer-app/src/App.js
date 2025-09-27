import React, { useEffect, useMemo, useState } from 'react';
import LandingPage from './LandingPage'; // Import the new LandingPage component

// --- API base ---
const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

// --- Simple theme tokens ---
const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

const containerStyle = {
  minHeight: '100vh',
  background: mainBg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: font,
};

const cardStyle = {
  background: cardBg,
  border: `1px solid ${border}`,
  borderRadius: 12,
  padding: 24,
  width: 420,
  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
};

const titleStyle = {
  margin: 0,
  marginBottom: 8,
  color: '#1a1a1a',
  fontSize: 22,
  fontWeight: 600,
};

const subtitleStyle = {
  marginTop: 0,
  marginBottom: 20,
  color: '#666',
  fontSize: 13,
};

const labelStyle = { display: 'block', fontSize: 13, color: '#333', marginBottom: 6 };
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${border}`,
  outline: 'none',
  background: '#fff'
};
const textAreaStyle = {
  ...inputStyle,
  minHeight: 72,
  resize: 'vertical'
};
const primaryBtn = {
  width: '100%',
  marginTop: 16,
  padding: '10px 12px',
  background: accent,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};
const secondaryBtn = {
  ...primaryBtn,
  background: '#555'
};
const linkBar = { marginTop: 16, display: 'flex', justifyContent: 'space-between' };
const linkBtn = {
  background: 'transparent',
  color: accent,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
};
const errorStyle = { color: 'red', marginTop: 8, fontSize: 13 };
const infoStyle = { color: '#555', marginTop: 8, fontSize: 13 };

// --- Helpers ---
const fmtDateTime = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  } catch {
    return '-';
  }
};
const fmtMins = (n) => (n == null ? '-' : `${Number(n).toFixed(2)} min`);

// --- Auth-aware storage helpers ---
const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Login Form Component
function LoginForm({ setView, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Demo credentials for quick testing (frontend only)
  const TEST_USER = 'customer@example.com';
  const TEST_PASS = 'customer123';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Allow demo login without backend
    if (email === TEST_USER && password === TEST_PASS) {
      const demoUser = {
        _id: '64b1f0f0f0f0f0f0f0f0f0f0', // 24-hex placeholder
        name: 'Demo Customer',
        email: TEST_USER,
        role: 'customer'
      };
      localStorage.setItem('token', 'demo');
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      setView('home');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setView('home');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div style={errorStyle}>{error}</div>}
      <button type="submit" style={primaryBtn}>Login</button>
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Demo login: customer@example.com / customer123</div>
      <div style={linkBar}>
        <button type="button" style={linkBtn} onClick={() => setView('signup')}>Sign Up</button>
        <button type="button" style={linkBtn} onClick={() => setView('reset')}>Forgot Password?</button>
      </div>
    </form>
  );
}

// Sign Up Form Component
function SignUpForm({ setView }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, role, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to register. Please try again.');
        return;
      }

      setView('login');
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Registration error:', err);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label style={labelStyle}>Name</label>
        <input
          type="text"
          placeholder="Enter name"
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Phone</label>
        <input
          type="text"
          placeholder="Enter phone number"
          style={inputStyle}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Address</label>
        <input
          type="text"
          placeholder="Enter address"
          style={inputStyle}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Role</label>
        <select
          style={{ ...inputStyle, height: 40 }}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="rider">Rider</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm password"
          style={inputStyle}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      {error && <div style={errorStyle}>{error}</div>}
      <button type="submit" style={primaryBtn}>Sign Up</button>
      <div style={{ marginTop: 16 }}>
        <button type="button" style={linkBtn} onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
}

// Simple Reset Password stub (UI only)
function ResetPassword({ setView }) {
  const [email, setEmail] = useState('');
  return (
    <div>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12, color: '#555', fontSize: 13 }}>
        Password reset flow is not implemented in the backend yet.
      </div>
      <div style={{ marginTop: 16 }}>
        <button type="button" style={linkBtn} onClick={() => setView('login')}>Back to Login</button>
      </div>
    </div>
  );
}

function Home({ setView, onLogout }) {
  return (
    <div>
      <div style={{ color: '#333', marginBottom: 12 }}>Welcome.</div>
      <div style={{ display: 'grid', gap: 8 }}>
        <button type="button" style={primaryBtn} onClick={() => setView('landingPage')}>Submit Repair Request</button>
        <button type="button" style={secondaryBtn} onClick={() => setView('orders')}>My Orders</button>
        <button type="button" style={{ ...primaryBtn, background: '#b00020' }} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

function SubmitRepairForm({ user, setView, onOrderCreated, selectedService }) {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [racketDetails, setRacketDetails] = useState('');
  const [preferredPickupTime, setPreferredPickupTime] = useState('');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendors`);
        if (!res.ok) throw new Error('Failed to load vendors');
        const data = await res.json();
        if (mounted) setVendors(data || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedService) {
      setRacketDetails(`${selectedService.sport} - ${selectedService.serviceType}`);
    }
  }, [selectedService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user || !user._id) {
      setError('User not found. Please login again.');
      return;
    }
    if (!vendorId) {
      setError('Please select a vendor');
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('customerId', user._id);
      fd.append('vendorId', vendorId);
      if (pickupAddress) fd.append('pickupAddress', pickupAddress);
      if (deliveryAddress) fd.append('deliveryAddress', deliveryAddress);
      if (racketDetails) fd.append('racketDetails', racketDetails);
      if (notes) fd.append('notes', notes);

      if (preferredPickupTime) {
        const iso = new Date(preferredPickupTime).toISOString();
        fd.append('preferredPickupTime', iso);
      }
      if (preferredDeliveryTime) {
        const iso = new Date(preferredDeliveryTime).toISOString();
        fd.append('preferredDeliveryTime', iso);
      }

      if (file) fd.append('racketImage', file);

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }
      onOrderCreated?.(data._id);
      setView('orderDetail');
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label style={labelStyle}>Choose Vendor</label>
          <select style={{ ...inputStyle, height: 40 }} value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
            <option value="">Select a vendor</option>
            {vendors.map(v => (
              <option key={v._id} value={v._id}>{v.shopName || v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Pickup Address</label>
          <input style={inputStyle} value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Court/Location for pickup" />
        </div>
        <div>
          <label style={labelStyle}>Delivery Address</label>
          <input style={inputStyle} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Court/Location for return" />
        </div>
        <div>
          <label style={labelStyle}>Racket Details</label>
          <textarea style={textAreaStyle} value={racketDetails} onChange={(e) => setRacketDetails(e.target.value)} placeholder="Brand, model, issues, string tension preference, etc." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Preferred Pickup Time</label>
            <input type="datetime-local" style={inputStyle} value={preferredPickupTime} onChange={(e) => setPreferredPickupTime(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Preferred Delivery Time</label>
            <input type="datetime-local" style={inputStyle} value={preferredDeliveryTime} onChange={(e) => setPreferredDeliveryTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Additional Notes</label>
          <textarea style={textAreaStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions or comments" />
        </div>
        <div>
          <label style={labelStyle}>Racket Image</label>
          <input type="file" accept="image/*" style={inputStyle} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Max 5MB. Image is optional.</div>
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ ...primaryBtn, flex: 1 }} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
          <button type="button" style={{ ...secondaryBtn, flex: 1 }} onClick={() => setView('home')}>Cancel</button>
        </div>
      </div>
    </form>
  );
}

function OrdersList({ user, setView, setSelectedOrderId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders?customerId=${encodeURIComponent(user._id)}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ ...titleStyle, margin: 0 }}>My Orders</h3>
        <button type="button" style={linkBtn} onClick={() => setView('home')}>Back</button>
      </div>
      {loading ? (
        <div style={infoStyle}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={infoStyle}>No orders yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {orders.map(o => (
            <div key={o._id} style={{ border: `1px solid ${border}`, borderRadius: 8, padding: 12, background: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>Order #{o._id.slice(-6)}</div>
              <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>Status: <b>{o.status}</b></div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Created: {fmtDateTime(o.createdAt)}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  style={{ ...primaryBtn, flex: 1 }}
                  onClick={() => { setSelectedOrderId(o._id); setView('orderDetail'); }}
                >
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button type="button" style={linkBtn} onClick={loadOrders}>Refresh</button>
      </div>
    </div>
  );
}

function Timeline({ status }) {
  const steps = ['pending', 'picked', 'in-progress', 'ready-for-delivery', 'delivered', 'completed'];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {steps.map((s, idx) => {
        const active = steps.indexOf(status) >= idx;
        return (
          <span
            key={s}
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              border: `1px solid ${active ? accent : border}`,
              background: active ? '#e3f2fd' : '#fafafa',
              color: active ? '#0d47a1' : '#777',
              fontSize: 12
            }}
          >
            {s}
          </span>
        );
      })}
    </div>
  );
}

function OrderDetail({ orderId, setView }) {
  const [order, setOrder] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pickupOtpInput, setPickupOtpInput] = useState(''); // State for customer's initial pickup OTP input
  const [returnOtpInput, setReturnOtpInput] = useState(''); // State for customer's final return OTP input

  const baseFile = useMemo(() => API_URL, []);

  const imgUrl = (p) => {
    if (!p) return null;
    const normalized = p.replace(/^\/+/, '');
    return `${baseFile}/${normalized}`;
  };

  const load = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const [dRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/orders/${orderId}/detail`),
        fetch(`${API_URL}/api/orders/${orderId}/summary`)
      ]);
      const [d, s] = await Promise.all([dRes.json(), sRes.json()]);
      if (!dRes.ok) throw new Error(d.error || 'Failed to load order');
      if (!sRes.ok) throw new Error(s.error || 'Failed to load summary');
      setOrder(d);
      setSummary(s);
      setErr('');
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleRiderPickupOtpVerification = async () => {
    if (!pickupOtpInput) {
      alert('Please enter the OTP provided by the rider for pickup.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: pickupOtpInput }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'OTP verification failed for pickup.');
        return;
      }
      alert('Racket pickup confirmed!');
      setPickupOtpInput('');
      await load(); // Reload order details to reflect status change
    } catch (e) {
      console.error(e);
      alert('An error occurred during pickup OTP verification.');
    }
  };

  const handleCustomerReturnOtpVerification = async () => {
    if (!returnOtpInput) {
      alert('Please enter the OTP provided by the rider for return.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/customer-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: returnOtpInput }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'OTP verification failed for return.');
        return;
      }
      alert('Racket return confirmed!');
      setReturnOtpInput('');
      await load(); // Reload order details to reflect status change
    } catch (e) {
      console.error(e);
      alert('An error occurred during return OTP verification.');
    }
  };

  const payNow = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentReference: `TEST-${Date.now()}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setOrder(data);
    } catch (e) {
      alert(e.message || 'Payment failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ ...titleStyle, margin: 0 }}>Order Detail</h3>
        <button type="button" style={linkBtn} onClick={() => setView('orders')}>Back</button>
      </div>
      {loading ? (
        <div style={infoStyle}>Loading...</div>
      ) : err ? (
        <div style={errorStyle}>{err}</div>
      ) : !order ? (
        <div style={infoStyle}>Order not found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 14, color: '#222' }}>
            <div><b>Order ID:</b> {order._id}</div>
            <div><b>Status:</b> {order.status}</div>
            <Timeline status={order.status} />
          </div>

          {/* Customer OTP for Rider Pickup */}
          {order.status === 'pending' && (
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8 }}>
              <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 6 }}>Rider Pickup OTP</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Enter OTP from Rider"
                  style={{ ...inputStyle, flex: 1 }}
                  value={pickupOtpInput}
                  onChange={(e) => setPickupOtpInput(e.target.value)}
                  required
                  disabled={order.status !== 'pending'} // Disable if not pending
                />
                <button
                  type="button"
                  style={{ ...primaryBtn, width: 'auto', marginTop: 0, padding: '10px 16px' }}
                  onClick={handleRiderPickupOtpVerification}
                  disabled={order.status !== 'pending'} // Disable if not pending
                >
                  Confirm Pickup
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Please enter the OTP provided by the rider to confirm racket pickup.
              </div>
            </div>
          )}

          {/* Customer OTP for Final Racket Return */}
          {(order.status === 'out-for-delivery' || order.status === 'delivered') && (
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8 }}>
              <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 6 }}>Customer Return OTP</div>
              {order.status === 'out-for-delivery' && (
                <div style={{ fontSize: 16, fontWeight: 700, color: accent, marginBottom: 12 }}>
                  OTP to share with Rider: {order.customerReturnOtp}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Please share this OTP with the rider to confirm racket return.
              </div>
            </div>
          )}

          <div style={{ fontSize: 13, color: '#333', display: 'grid', gap: 4 }}>
            <div><b>Pickup Address:</b> {order.pickupAddress || '-'}</div>
            <div><b>Delivery Address:</b> {order.deliveryAddress || '-'}</div>
            <div><b>Preferred Pickup:</b> {fmtDateTime(order.preferredPickupTime)}</div>
            <div><b>Preferred Delivery:</b> {fmtDateTime(order.preferredDeliveryTime)}</div>
            <div><b>Notes:</b> {order.notes || '-'}</div>
            <div><b>Price:</b> {order.price != null ? `₹${order.price}` : '-'}</div>
            <div><b>Payment:</b> {order.paymentStatus} {order.paymentReference ? `(${order.paymentReference})` : ''}</div>
          </div>

          {summary && (
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8 }}>
              <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 6 }}>Service Timers</div>
              <div style={{ fontSize: 13, color: '#333' }}>
                <div>Total Rider Time: {fmtMins(summary.totalRiderTime)}</div>
                <div>Total Vendor Time: {fmtMins(summary.totalVendorTime)}</div>
                <div>Total Service Time: {summary.totalServiceTime != null ? fmtMins(summary.totalServiceTime) : '-'}</div>
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8 }}>
            <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 6 }}>Images</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {order.racketImage && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Racket</div>
                  <img alt="racket" src={imgUrl(order.racketImage)} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}` }} />
                </div>
              )}
              {order.pickupEvidenceImage && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Pickup Evidence</div>
                  <img alt="pickup" src={imgUrl(order.pickupEvidenceImage)} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}` }} />
                </div>
              )}
              {order.deliveryToVendorEvidenceImage && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Delivered to Vendor</div>
                  <img alt="toVendor" src={imgUrl(order.deliveryToVendorEvidenceImage)} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}` }} />
                </div>
              )}
              {order.serviceCompleteEvidenceImage && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Service Complete</div>
                  <img alt="serviceComplete" src={imgUrl(order.serviceCompleteEvidenceImage)} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}` }} />
                </div>
              )}
              {order.returnToCourtEvidenceImage && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Returned to Court</div>
                  <img alt="returnCourt" src={imgUrl(order.returnToCourtEvidenceImage)} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}` }} />
                </div>
              )}
              {order.customerPickupEvidenceImage && (
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Customer Pickup</div>
                  <img alt="customerPickup" src={imgUrl(order.customerPickupEvidenceImage)} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}` }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" style={{ ...primaryBtn, flex: 1 }} onClick={load}>Refresh</button>
            {order.paymentStatus !== 'paid' && (
              <button type="button" style={{ ...secondaryBtn, flex: 1 }} onClick={payNow}>
                Pay Now (stub)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(localStorage.getItem('token') ? 'home' : 'login');
  const [user, setUser] = useState(loadStoredUser());
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedService, setSelectedService] = useState(null); // New state for selected service

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
    setSelectedOrderId(null);
    setSelectedService(null); // Clear selected service on logout
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Badminton Service</h1>
        <p style={subtitleStyle}>
          Submit repair requests, track status, and manage payments
        </p>

        {view === 'login' && <LoginForm setView={setView} setUser={setUser} />}
        {view === 'signup' && <SignUpForm setView={setView} />}
        {view === 'reset' && <ResetPassword setView={setView} />}
        {view === 'home' && <Home setView={setView} onLogout={onLogout} />}
        {view === 'landingPage' && <LandingPage setView={setView} onServiceSelect={setSelectedService} />}
        {view === 'submit' && <SubmitRepairForm user={user} setView={setView} onOrderCreated={setSelectedOrderId} selectedService={selectedService} />}
        {view === 'orders' && user && <OrdersList user={user} setView={setView} setSelectedOrderId={setSelectedOrderId} />}
        {view === 'orderDetail' && selectedOrderId && <OrderDetail orderId={selectedOrderId} setView={setView} />}
      </div>
    </div>
  );
}
