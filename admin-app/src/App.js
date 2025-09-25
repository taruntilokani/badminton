import React, { useEffect, useState } from 'react';
import AdminSignup from './AdminSignup';

const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

function App() {
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;

  const fetchReport = async (jwt) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${baseUrl}/api/admin/orders-report`, {
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to load orders (status ${res.status})`);
      }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user, password: pass })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Login failed (status ${res.status})`);
      }
      const jwt = data.token;
      setToken(jwt || '');
      setLoggedIn(true);
      setUser('');
      setPass('');
      await fetchReport(jwt);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setToken('');
    setRequests([]);
    setUser('');
    setPass('');
    setShowSignup(false);
    setError('');
  };

  useEffect(() => {
    if (loggedIn && token) {
      // On mount after login, ensure we have fresh data
      fetchReport(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, token]);

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: font, padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 720, margin: '48px auto', background: cardBg, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}`, padding: 32 }}>
        <h2 style={{ color: accent, fontWeight: 700, marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>Admin Dashboard</h2>
        {!loggedIn ? (
          showSignup ? (
            <AdminSignup onSuccess={() => setShowSignup(false)} />
          ) : (
            <>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input type="text" placeholder="Email" value={user} onChange={e => setUser(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }} />
                <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }} />
                {error && <div style={{ color: '#d32f2f', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
                <button type="submit" disabled={loading} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </form>
              <div style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12 }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => setShowSignup(true)} style={{ color: accent, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Create one
                </button>
              </div>
            </>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h3 style={{ color: accent, fontWeight: 600, marginBottom: 0 }}>All Services</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => fetchReport(token)} disabled={loading} style={{ background: '#0288d1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button type="button" onClick={handleLogout} style={{ background: '#9e9e9e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Logout
                </button>
              </div>
            </div>
            {error && <div style={{ color: '#d32f2f', fontWeight: 500 }}>{error}</div>}
            {requests.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 12 }}>No services found.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {requests.map(r => (
                  <div key={r.orderId} style={{ background: mainBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Created: {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}><span style={{ color: accent }}>Order:</span> {r.orderId}</div>
                    <div style={{ fontSize: 14, marginBottom: 6 }}><span style={{ color: accent }}>Status:</span> {r.status}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Rider Time:</span> {r.totalRiderTime != null ? `${r.totalRiderTime} min` : '-'}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Vendor Time:</span> {r.totalVendorTime != null ? `${r.totalVendorTime} min` : '-'}</div>
                    <div style={{ fontSize: 14 }}><span style={{ color: accent }}>Total Service:</span> {r.totalServiceTime != null ? `${r.totalServiceTime} min` : '-'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
