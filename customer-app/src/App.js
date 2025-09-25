import React, { useState } from 'react';

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
  width: 360,
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
const linkBar = { marginTop: 16, display: 'flex', justifyContent: 'space-between' };
const linkBtn = {
  background: 'transparent',
  color: accent,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
};
const errorStyle = { color: 'red', marginTop: 8, fontSize: 13 };

// Login Form Component
function LoginForm({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
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
      const response = await fetch('/api/users/register', {
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

function Home({ setView }) {
  const logout = () => {
    localStorage.removeItem('token');
    setView('login');
  };
  return (
    <div>
      <div style={{ color: '#333', marginBottom: 12 }}>You are logged in.</div>
      <button type="button" style={primaryBtn} onClick={logout}>Logout</button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(localStorage.getItem('token') ? 'home' : 'login');

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Badminton Service</h1>
        <p style={subtitleStyle}>
          Manage your account and orders
        </p>

        {view === 'login' && <LoginForm setView={setView} />}
        {view === 'signup' && <SignUpForm setView={setView} />}
        {view === 'reset' && <ResetPassword setView={setView} />}
        {view === 'home' && <Home setView={setView} />}
      </div>
    </div>
  );
}
