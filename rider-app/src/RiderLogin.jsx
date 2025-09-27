import React, { useState } from 'react';

const API = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const accent = '#1976d2';
const border = '#e0e0e0';

function RiderLogin({ onFoundRider, goSignup }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/riders`);
      if (!res.ok) throw new Error('Failed to fetch riders');
      const list = await res.json();
      const match = (list || []).find((r) => (r.email || '').toLowerCase() === email.toLowerCase());
      if (!match) {
        setErr('Rider not found. Please sign up.');
        return;
      }
      onFoundRider(match);
    } catch (e2) {
      setErr(e2.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: accent, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>Rider Dashboard</h2>
      <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Enter rider email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Create Rider Account
        </button>
      </div>
    </div>
  );
}

export default RiderLogin;
