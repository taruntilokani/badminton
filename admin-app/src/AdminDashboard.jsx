import React, { useEffect, useState } from 'react';
import UserManagement from './UserManagement';

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
  const [selectedTab, setSelectedTab] = useState('allOrders'); // New state for tabs

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
    if (token && selectedTab === 'allOrders') { // Fetch orders only when 'allOrders' tab is active
      fetchOrders();
    }
  }, [token, selectedTab]); // Re-fetch when tab changes to 'allOrders'

  const tabButtonStyle = (tabName) => ({
    background: selectedTab === tabName ? accent : '#f0f0f0',
    color: selectedTab === tabName ? '#fff' : '#333',
    border: `1px solid ${border}`,
    borderRadius: '8px 8px 0 0',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 16,
    marginRight: 4,
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: selectedTab === tabName ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
  });

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, background: mainBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sticky Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 100,
        position: 'sticky',
        top: 0,
        width: '100%'
      }}>
        <h2 style={{ color: accent, fontWeight: 700, margin: 0 }}>Admin Dashboard</h2>
        <button type="button" onClick={onLogout} style={{ background: '#b00020', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', borderBottom: `2px solid ${accent}`, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setSelectedTab('allOrders')}
            style={tabButtonStyle('allOrders')}
          >
            All Orders
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('userManagement')}
            style={tabButtonStyle('userManagement')}
          >
            User Management
          </button>
        </div>

        {selectedTab === 'allOrders' && (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '20px', marginBottom: '20px' }}>
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
              <div style={{ overflowX: 'auto', width: '100%' }}> {/* Ensure table container takes full width */}
                <table style={{ width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{ background: accent, color: '#fff', position: 'sticky', top: 0, zIndex: 99 }}>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Order ID</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Status</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Customer</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Vendor</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Rider</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Pickup OTP</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Delivery to Vendor OTP</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Vendor Handover OTP</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Customer Return OTP</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Pickup Address</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Delivery Address</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Racket Details</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Quote Amount</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Price</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Payment Status</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', border: `1px solid ${border}` }}>Created At</th>
                      <th style={{ padding: '12px 15px', border: `1px solid ${border}` }}>Rider Time (min)</th>
                      <th style={{ padding: '12px 15px', border: `1px solid ${border}` }}>Vendor Time (min)</th>
                      <th style={{ padding: '12px 15px', border: `1px solid ${border}` }}>Total Service Time (min)</th>
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
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.pickupAddress || '-'}</td>
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.deliveryAddress || '-'}</td>
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.racketDetails || '-'}</td>
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{money(o.quoteAmount)}</td>
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{money(o.price)}</td>
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{o.paymentStatus || '-'}</td>
                        <td style={{ padding: '10px 15px', border: `1px solid ${border}` }}>{fmtDate(o.createdAt)}</td>
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
        )}
        {selectedTab === 'userManagement' && <UserManagement />}
      </div>
    </div>
  );
}

export default AdminDashboard;
