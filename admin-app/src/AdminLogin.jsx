import React, { useState } from 'react';

const API = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const accent = '#1976d2';
const border = '#e0e0e0';

function AdminLogin({ onLoginSuccess, goSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Login failed (status ${res.status})`);
      }
      onLoginSuccess(data.token);
    } catch (e2) {
      setErr(e2.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: accent, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>Admin Dashboard</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }}
          required
        />
        {err && <div style={{ color: '#d32f2f', fontWeight: 500 }}>{err}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <div style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12 }}>
        New here?{' '}
        <button type="button" onClick={goSignup} style={{ color: accent, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Create Admin Account
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
