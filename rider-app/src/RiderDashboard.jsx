import React, { useEffect, useMemo, useState } from 'react';

const API = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const accent = '#1976d2';
const border = '#e0e0e0';
const sectionTitle = { color: accent, fontWeight: 600, marginBottom: 12 };

const fmtDate = (v) => (v ? new Date(v).toLocaleString() : '-');

function RiderOrdersList({ rider, filter, onAction }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState({}); // orderId -> otp value

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders?riderId=${encodeURIComponent(rider._id)}${filter ? `&status=${encodeURIComponent(filter)}` : ''}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rider?._id) reload();
  }, [rider?._id, filter]);

  const handlePickup = async (orderId) => {
    const otp = otpInput[orderId];
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Pickup failed');
        return;
      }
      alert('Racket picked up successfully!');
      setOtpInput((s) => ({ ...s, [orderId]: '' }));
      await reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during pickup.');
    }
  };

  const handleDeliverToVendor = async (orderId) => {
    const otp = otpInput[orderId];
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/deliver-to-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Delivery to vendor failed');
        return;
      }
      alert('Racket delivered to vendor successfully!');
      setOtpInput((s) => ({ ...s, [orderId]: '' }));
      await reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during delivery to vendor.');
    }
  };

  const handleReturnToCourt = async (orderId) => {
    const otp = otpInput[orderId];
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/return-to-court`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Return to court failed');
        return;
      }
      alert('Racket returned to court successfully!');
      setOtpInput((s) => ({ ...s, [orderId]: '' }));
      await reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during return to court.');
    }
  };

  const handlePickupFromVendor = async (orderId) => {
    const otp = otpInput[orderId];
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/vendor-handover-to-rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Pickup from vendor failed');
        return;
      }
      alert('Racket picked up from vendor successfully!');
      setOtpInput((s) => ({ ...s, [orderId]: '' }));
      await reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during pickup from vendor.');
    }
  };

  const actionBar = (o) => {
    if (o.status === 'pending') {
      return (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            type="text"
            placeholder="Pickup OTP"
            value={otpInput[o._id] || ''}
            onChange={(e) => setOtpInput((s) => ({ ...s, [o._id]: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14 }}
          />
          <button type="button" onClick={() => handlePickup(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Pick Up Racket
          </button>
        </div>
      );
    }
    if (o.status === 'picked') {
      return (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            type="text"
            placeholder="Delivery OTP to Vendor"
            value={otpInput[o._id] || ''}
            onChange={(e) => setOtpInput((s) => ({ ...s, [o._id]: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14 }}
          />
          <button type="button" onClick={() => handleDeliverToVendor(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Deliver to Vendor
          </button>
        </div>
      );
    }
    if (o.status === 'vendor-completed-service-awaiting-rider-pickup') {
      return (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            type="text"
            placeholder="OTP from Vendor"
            value={otpInput[o._id] || ''}
            onChange={(e) => setOtpInput((s) => ({ ...s, [o._id]: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14 }}
          />
          <button type="button" onClick={() => handlePickupFromVendor(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Pick Up from Vendor
          </button>
        </div>
      );
    }
    if (o.status === 'out-for-delivery') {
      return (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            type="text"
            placeholder="Return OTP to Customer"
            value={otpInput[o._id] || ''}
            onChange={(e) => setOtpInput((s) => ({ ...s, [o._id]: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14 }}
          />
          <button type="button" onClick={() => handleReturnToCourt(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Return to Court
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>
        Showing jobs for <b>{rider.name || rider.email}</b>
      </div>
      {loading ? (
        <div style={{ color: '#666' }}>Loading…</div>
      ) : !orders || orders.length === 0 ? (
        <div style={{ color: '#888' }}>No orders found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {orders.map((o) => (
            <div key={o._id} style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 600, color: '#222' }}>#{o._id.slice(-6)}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{fmtDate(o.createdAt)}</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 14, color: '#333' }}>
                <div>Status: <b>{o.status}</b></div>
                <div>Pickup Address: {o.pickupAddress || '-'}</div>
                <div>Delivery Address: {o.deliveryAddress || '-'}</div>
                {o.status === 'pending' && <div>Pickup OTP: {o.riderPickupOtp}</div>}
                {o.status === 'picked' && <div>Delivery to Vendor OTP: {o.riderDeliveryToVendorOtp}</div>}
                {o.status === 'vendor-completed-service-awaiting-rider-pickup' && <div>Pickup from Vendor OTP: {o.vendorHandoverToRiderOtp}</div>}
                {o.status === 'out-for-delivery' && <div>Return to Customer OTP: {o.riderReturnOtp}</div>}
              </div>
              {actionBar(o)}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={reload} style={{ background: 'transparent', color: accent, border: `1px solid ${accent}`, borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>
    </div>
  );
}

function RiderDashboard({ rider, onLogout }) {
  const [tab, setTab] = useState('incoming'); // incoming | history
  const [statusFilter, setStatusFilter] = useState('');

  const tabs = useMemo(() => ([
    { key: 'incoming', label: 'Incoming Jobs' },
    { key: 'history', label: 'Job History' },
  ]), []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <h2 style={{ color: accent, fontWeight: 700, margin: 0 }}>{rider.name || 'Rider Dashboard'}</h2>
        <button type="button" onClick={onLogout} style={{ background: '#b00020', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? accent : 'transparent',
              color: tab === t.key ? '#fff' : accent,
              border: `1px solid ${accent}`,
              borderRadius: 999,
              padding: '8px 14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === 'incoming' && (
          <>
            <div style={sectionTitle}>Incoming Jobs</div>
            <RiderOrdersList rider={rider} filter="pending" onAction={() => {}} />
          </>
        )}
        {tab === 'history' && (
          <>
            <div style={sectionTitle}>Job History</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: '#555' }}>Filter by status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 8, borderRadius: 6, border: `1px solid ${border}`, background: '#fff' }}>
                <option value="">All</option>
                <option value="pending">pending</option>
                <option value="picked">picked</option>
                <option value="in-progress">in-progress</option>
                <option value="ready-for-delivery">ready-for-delivery</option>
                <option value="out-for-delivery">out-for-delivery</option>
                <option value="vendor-completed-service-awaiting-rider-pickup">vendor-completed-service-awaiting-rider-pickup</option>
                <option value="delivered">delivered</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <RiderOrdersList rider={rider} filter={statusFilter} onAction={() => {}} />
          </>
        )}
      </div>
    </div>
  );
}

export default RiderDashboard;
