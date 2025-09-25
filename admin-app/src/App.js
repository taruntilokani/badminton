export default App;
import React, { useState } from 'react';
const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [requests, setRequests] = useState([
    { id: "REQ123456", riderTime: 10, vendorTime: 20, status: "Completed" },
    { id: "REQ654321", riderTime: 10, vendorTime: 20, status: "Completed" }
  ]);
  // Sample login
  const TEST_USER = 'admin@example.com';
  const TEST_PASS = 'admin123';
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = e => {
    e.preventDefault();
    if (user === TEST_USER && pass === TEST_PASS) {
      setLoggedIn(true);
      // Simulate fetching requests
      setRequests(["REQ123456", "REQ654321"]);
    } else {
      setError('Invalid credentials. Use admin@example.com / admin123');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: font, padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 480, margin: '48px auto', background: cardBg, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}`, padding: 32 }}>
        <h2 style={{ color: accent, fontWeight: 700, marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>Admin Dashboard</h2>
        {!loggedIn ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input type="text" placeholder="Email" value={user} onChange={e => setUser(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }} />
            <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }} />
            {error && <div style={{ color: '#d32f2f', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
            <button type="submit" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>Login</button>
          </form>
        ) : (
          <div>
            <h3 style={{ color: accent, fontWeight: 600, marginBottom: 16 }}>All Requests</h3>
            {requests.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No requests found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {requests.map(r => (
                  <div key={r.id} style={{ background: mainBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}><span style={{ color: accent }}>ID:</span> {r.id}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Status:</span> {r.status}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Rider Time:</span> {r.riderTime} min</div>
                    <div style={{ fontSize: 14 }}><span style={{ color: accent }}>Vendor Time:</span> {r.vendorTime} min</div>
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
