import React, { useState } from 'react';
const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [requests, setRequests] = useState([
    { id: "REQ123456", status: "Waiting for vendor", vendorTime: 0, otp: "333333" },
    { id: "REQ654321", status: "Waiting for vendor", vendorTime: 0, otp: "444444" }
  ]);
  const [activeOtp, setActiveOtp] = useState('');
  // Sample login
  const TEST_USER = 'vendor@example.com';
  const TEST_PASS = 'vendor123';
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = e => {
    e.preventDefault();
    if (user === TEST_USER && pass === TEST_PASS) {
      setLoggedIn(true);
      // Simulate fetching requests
  // Requests already initialized above
    } else {
      setError('Invalid credentials. Use vendor@example.com / vendor123');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: font, padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 480, margin: '48px auto', background: cardBg, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}`, padding: 32 }}>
        <h2 style={{ color: accent, fontWeight: 700, marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>Vendor Dashboard</h2>
        {!loggedIn ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input type="text" placeholder="Email" value={user} onChange={e => setUser(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }} />
            <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 16 }} />
            {error && <div style={{ color: '#d32f2f', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
            <button type="submit" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>Login</button>
          </form>
        ) : (
          <div>
            <h3 style={{ color: accent, fontWeight: 600, marginBottom: 16 }}>New Requests</h3>
            {requests.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No requests found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {requests.map((r, idx) => (
                  <div key={r.id} style={{ background: mainBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}><span style={{ color: accent }}>ID:</span> {r.id}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Status:</span> {r.status}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Vendor Time:</span> {r.vendorTime} min</div>
                    {r.status === "Waiting for vendor" && (
                      <form onSubmit={e => {
                        e.preventDefault();
                        if (activeOtp === r.otp) {
                          const updated = [...requests];
                          updated[idx].status = "Repair started";
                          updated[idx].vendorTime = 20; // Simulate time
                          setRequests(updated);
                          setActiveOtp('');
                        }
                      }} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input type="text" placeholder="Enter OTP" value={activeOtp} onChange={e => setActiveOtp(e.target.value)} style={{ padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 15 }} />
                        <button type="submit" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Verify Vendor</button>
                      </form>
                    )}
                    {r.status === "Repair started" && <div style={{ color: '#388e3c', fontWeight: 500, marginTop: 8 }}>Repair in progress. Notify rider when done.</div>}
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
