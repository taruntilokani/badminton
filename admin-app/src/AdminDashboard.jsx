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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: accent, color: '#fff' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Order ID</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Status</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Customer</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Vendor</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Rider</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Pickup OTP</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Delivery to Vendor OTP</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Vendor Handover OTP</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Customer Return OTP</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Rider Time (min)</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Vendor Time (min)</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Total Service Time (min)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.orderId} style={{ background: '#fff', borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.orderId}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}><b>{o.status}</b></td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.customerId}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.vendorId}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.riderId || '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.riderPickupOtp || '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.riderDeliveryToVendorOtp || '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.vendorHandoverToRiderOtp || '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.customerReturnOtp || '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.totalRiderTime != null ? o.totalRiderTime.toFixed(2) : '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.totalVendorTime != null ? o.totalVendorTime.toFixed(2) : '-'}</td>
                    <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.totalServiceTime != null ? o.totalServiceTime.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
