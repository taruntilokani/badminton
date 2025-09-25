import React, { useState } from 'react';

const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

function RiderSignup({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!form.name || !form.email || !form.phone || !form.vehicle) {
      setErr('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Signup failed with status ${res.status}`);
      }
      setMsg('Rider account created successfully.');
      setForm({ name: '', email: '', phone: '', vehicle: '' });
      if (onSuccess) onSuccess();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: font }}>
      <h3 style={{ color: accent, fontWeight: 600, margin: 0, textAlign: 'center' }}>Create Rider Account</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16, background: cardBg }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16, background: cardBg }}
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16, background: cardBg }}
        />
        <input
          name="vehicle"
          type="text"
          placeholder="Vehicle (e.g., Bike, Scooter)"
          value={form.vehicle}
          onChange={handleChange}
          style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16, background: cardBg }}
        />
        {err && <div style={{ color: '#d32f2f', fontWeight: 500 }}>{err}</div>}
        {msg && <div style={{ color: '#2e7d32', fontWeight: 500 }}>{msg}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.8 : 1 }}
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <div style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
        Already have an account?{' '}
        <button type="button" onClick={() => onSuccess && onSuccess()} style={{ color: accent, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default RiderSignup;
