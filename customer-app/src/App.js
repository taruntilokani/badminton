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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Store token in local storage or state
        localStorage.setItem('token', data.token);
        setView('home');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email</label>
        <input type="email" placeholder="Enter email" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

const handleSignUp = async (e) => {
>>>>>>> REPLACE
  e.preventDefault();
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
      const errorData = await response.json();
      setError(errorData.error || 'Failed to register. Please try again.');
      return;
    }

    setView('login');
} catch (err) {
  setError('An error occurred during registration. Please try again.');
  console.error('Registration error:', err);
>>>>>>> REPLACE
  }
};
>>>>>>> REPLACE

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label>Name</label>
        <input type="text" placeholder="Enter name" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Email</label>
        <input type="email" placeholder="Enter email" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Phone</label>
        <input type="text" placeholder="Enter phone number" style={{ width: '100%' }} value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Address</label>
        <input type="text" placeholder="Enter address" style={{ width: '100%' }} value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Password</label>
        <input type="password" placeholder="Enter password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm password" style={{ width: '100%' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>Sign Up</button>
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
}

// Rest of the code remains the same
const handleSignUp = async (e) => {
>>>>>>> REPLACE
  e.preventDefault();
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
      const errorData = await response.json();
      setError(errorData.error || 'Failed to register. Please try again.');
      return;
    }

    setView('login');
} catch (err) {
  setError('An error occurred during registration. Please try again.');
  console.error('Registration error:', err);
>>>>>>> REPLACE
  }
};
>>>>>>> REPLACE

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label>Name</label>
        <input type="text" placeholder="Enter name" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Email</label>
        <input type="email" placeholder="Enter email" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Phone</label>
        <input type="text" placeholder="Enter phone number" style={{ width: '100%' }} value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Address</label>
        <input type="text" placeholder="Enter address" style={{ width: '100%' }} value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Password</label>
        <input type="password" placeholder="Enter password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm password" style={{ width: '100%' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>Sign Up</button>
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
}

const handleSignUp = async (e) => {
>>>>>>> REPLACE
  e.preventDefault();
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
      const errorData = await response.json();
      setError(errorData.error || 'Failed to register. Please try again.');
      return;
    }

    setView('login');
} catch (err) {
  setError('An error occurred during registration. Please try again.');
  console.error('Registration error:', err);
>>>>>>> REPLACE
  }
};
>>>>>>> REPLACE

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label>Name</label>
        <input type="text" placeholder="Enter name" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Email</label>
        <input type="email" placeholder="Enter email" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Phone</label>
        <input type="text" placeholder="Enter phone number" style={{ width: '100%' }} value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Address</label>
        <input type="text" placeholder="Enter address" style={{ width: '100%' }} value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Password</label>
        <input type="password" placeholder="Enter password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm password" style={{ width: '100%' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>Sign Up</button>
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
}

// Rest of the code remains the same
const handleSignUp = async (e) => {
>>>>>>> REPLACE
  e.preventDefault();
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
      const errorData = await response.json();
      setError(errorData.error || 'Failed to register. Please try again.');
      return;
    }

    setView('login');
} catch (err) {
  setError('An error occurred during registration. Please try again.');
  console.error('Registration error:', err);
>>>>>>> REPLACE
  }
};
>>>>>>> REPLACE

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label>Name</label>
        <input type="text" placeholder="Enter name" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Email</label>
        <input type="email" placeholder="Enter email" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Phone</label>
        <input type="text" placeholder="Enter phone number" style={{ width: '100%' }} value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Address</label>
        <input type="text" placeholder="Enter address" style={{ width: '100%' }} value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Password</label>
        <input type="password" placeholder="Enter password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm password" style={{ width: '100%' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>Sign Up</button>
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setView('login')}>Back to Login</button>
      </div>
    </form>
  );
