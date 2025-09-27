import React, { useEffect, useState } from 'react';

const API = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const accent = '#1976d2';
const border = '#e0e0e0';
const mainBg = '#f4f6fb';

const fmtDate = (v) => (v ? new Date(v).toLocaleString() : '-');
const money = (n) => (typeof n === 'number' ? `₹${n.toFixed(2)}` : '-');

function AdminDashboard({ token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/admin/orders-report`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to load orders (status ${res.status})`);
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <h2 style={{ color: accent, fontWeight: 700, margin: 0 }}>Admin Dashboard</h2>
        <button type="button" onClick={onLogout} style={{ background: '#b00020', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <h3 style={{ color: accent, fontWeight: 600, margin: 0 }}>All Orders</h3>
          <button type="button" onClick={fetchOrders} disabled={loading} style={{ background: '#0288d1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {error && <div style={{ color: '#d32f2f', fontWeight: 500, marginBottom: 16 }}>{error}</div>}
        {loading ? (
          <div style={{ color: '#666' }}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 12 }}>No orders found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {orders.map((o) => (
              <div key={o.orderId} style={{ background: mainBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Created: {fmtDate(o.createdAt)}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}><span style={{ color: accent }}>Order:</span> {o.orderId}</div>
                <div style={{ fontSize: 14, marginBottom: 6 }}><span style={{ color: accent }}>Status:</span> <b>{o.status}</b></div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Customer:</span> {o.customerId}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Vendor:</span> {o.vendorId}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Rider:</span> {o.riderId || '-'}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Pickup:</span> {o.pickupAddress || '-'}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Delivery:</span> {o.deliveryAddress || '-'}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Rider Time:</span> {o.totalRiderTime != null ? `${o.totalRiderTime} min` : '-'}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}><span style={{ color: accent }}>Vendor Time:</span> {o.totalVendorTime != null ? `${o.totalVendorTime} min` : '-'}</div>
                <div style={{ fontSize: 14 }}><span style={{ color: accent }}>Total Service:</span> {o.totalServiceTime != null ? `${o.totalServiceTime} min` : '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
