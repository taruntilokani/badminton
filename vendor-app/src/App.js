import React, { useEffect, useMemo, useState } from 'react';
import VendorSignup from './VendorSignup';

// Config
const API = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

const sectionTitle = { color: accent, fontWeight: 600, marginBottom: 12 };

// Helpers
const fmtDate = (v) => (v ? new Date(v).toLocaleString() : '-');
const money = (n) => (typeof n === 'number' ? `₹${n.toFixed(2)}` : '-');

const usePersisted = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
};

function Login({ onFoundVendor, goSignup }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vendors`);
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const list = await res.json();
      const match = (list || []).find((v) => (v.email || '').toLowerCase() === email.toLowerCase());
      if (!match) {
        setErr('Vendor not found. Please sign up.');
        return;
      }
      onFoundVendor(match);
    } catch (e2) {
      setErr(e2.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: accent, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>Vendor Dashboard</h2>
      <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Enter vendor email"
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
          Create Vendor Account
        </button>
      </div>
    </div>
  );
}

function OrdersList({ vendor, filter, onAction }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders?vendorId=${encodeURIComponent(vendor._id)}${filter ? `&status=${encodeURIComponent(filter)}` : ''}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (vendor?._id) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?._id, filter]);

  const [quoteVal, setQuoteVal] = useState({}); // orderId -> string
  const [quoteNotes, setQuoteNotes] = useState({});
  const [otpInput, setOtpInput] = useState({}); // orderId -> otp value

  const proposeQuote = async (id) => {
    const amount = parseFloat(quoteVal[id]);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid quote amount');
      return;
    }
    const body = { amount, notes: quoteNotes[id] || '' };
    const res = await fetch(`${API}/api/orders/${id}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Quote failed');
      return;
    }
    await reload();
  };

  const vendorAccept = async (id) => {
    const res = await fetch(`${API}/api/orders/${id}/vendor-accept`, { method: 'POST' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Accept failed');
      return;
    }
    await reload();
  };

  const vendorReject = async (id) => {
    const res = await fetch(`${API}/api/orders/${id}/vendor-reject`, { method: 'POST' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Reject failed');
      return;
    }
    await reload();
  };

  const startRepair = async (id) => {
    const res = await fetch(`${API}/api/orders/${id}/vendor-start`, { method: 'POST' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Start failed');
      return;
    }
    await reload();
  };

  const markComplete = async (id) => {
    const res = await fetch(`${API}/api/orders/${id}/service-complete`, { method: 'POST' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Complete failed');
      return;
    }
    alert('Service marked as completed! Rider will pick up the racket soon.');
    await reload();
  };

  const handleRiderDeliveryToVendor = async (orderId) => {
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
      alert('Racket delivered by rider successfully!');
      setOtpInput((s) => ({ ...s, [orderId]: '' }));
      await reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during delivery to vendor.');
    }
  };

  const handleVendorHandoverToRider = async (orderId) => {
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
        alert(d.error || 'Handover to rider failed');
        return;
      }
      alert('Racket handed over to rider successfully!');
      setOtpInput((s) => ({ ...s, [orderId]: '' }));
      await reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during handover to rider.');
    }
  };

  const actionBar = (o) => {
    // Quote actions
    if (o.quoteStatus === 'none' || o.quoteStatus === 'rejected') {
      return (
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Quote amount"
              value={quoteVal[o._id] || ''}
              onChange={(e) => setQuoteVal((s) => ({ ...s, [o._id]: e.target.value }))}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14 }}
            />
            <button type="button" onClick={() => proposeQuote(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
              Propose
            </button>
          </div>
          <textarea
            placeholder="Vendor notes (optional)"
            value={quoteNotes[o._id] || ''}
            onChange={(e) => setQuoteNotes((s) => ({ ...s, [o._id]: e.target.value }))}
            rows={2}
            style={{ padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14, resize: 'vertical' }}
          />
        </div>
      );
    }
    if (o.quoteStatus === 'proposed') {
      return (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button type="button" onClick={() => vendorAccept(o._id)} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Accept Job
          </button>
          <button type="button" onClick={() => vendorReject(o._id)} style={{ background: '#b00020', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Reject
          </button>
        </div>
      );
    }
    // Status actions
    const canStart = o.status === 'in-progress' && !o.vendorServiceStartTime;
    const canComplete = o.status === 'in-progress' && o.vendorServiceStartTime && !o.vendorServiceEndTime;
    const canHandover = o.status === 'vendor-completed-service-awaiting-rider-pickup';

    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {canStart && (
          <button type="button" onClick={() => startRepair(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Start Repair
          </button>
        )}
        {canComplete && (
          <button type="button" onClick={() => markComplete(o._id)} style={{ background: '#6a1b9a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
            Mark Completed
          </button>
        )}
        {canHandover && (
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <input
              type="text"
              placeholder="OTP from Rider"
              value={otpInput[o._id] || ''}
              onChange={(e) => setOtpInput((s) => ({ ...s, [o._id]: e.target.value }))}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${border}`, fontSize: 14 }}
            />
            <button type="button" onClick={() => handleVendorHandoverToRider(o._id)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
              Confirm Handover
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666' }}>
        Showing jobs for <b>{vendor.shopName || vendor.name || vendor.email}</b>
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
                <div>Quote: {o.quoteStatus} {typeof o.quoteAmount === 'number' ? `(${money(o.quoteAmount)})` : ''}</div>
                <div>Price: {money(o.price)}</div>
                <div>Payment: {o.paymentStatus || '-'}</div>
                {o.vendorNotes ? <div>Vendor Notes: {o.vendorNotes}</div> : null}
                {o.status === 'picked' && <div>Rider Delivery OTP: {o.riderDeliveryToVendorOtp}</div>}
                <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
                  Pickup: {o.pickupAddress || '-'} | Delivery: {o.deliveryAddress || '-'}
                </div>
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

function Earnings({ vendor }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vendors/${vendor._id}/earnings`);
      const d = await res.json();
      setData(d);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (vendor?._id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?._id]);

  return (
    <div>
      {loading ? (
        <div style={{ color: '#666' }}>Loading…</div>
      ) : !data ? (
        <div style={{ color: '#888' }}>No data.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 600, color: '#222' }}>Totals</div>
            <div style={{ marginTop: 6, fontSize: 14, color: '#333' }}>
              <div>Total Orders: {data.totalOrders}</div>
              <div>Completed Orders: {data.completedOrders}</div>
              <div>Paid Orders: {data.paidOrders}</div>
              <div>Total Revenue: {money(data.totalRevenue || 0)}</div>
              <div>Outstanding to Collect: {money(data.outstandingToCollect || 0)}</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={load} style={{ background: 'transparent', color: accent, border: `1px solid ${accent}`, borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>
    </div>
  );
}

function VendorDashboard({ vendor, onLogout }) {
  const [tab, setTab] = useState('incoming'); // incoming | history | earnings
  const [statusFilter, setStatusFilter] = useState('');

  const tabs = useMemo(() => ([
    { key: 'incoming', label: 'Incoming Jobs' },
    { key: 'history', label: 'Job History' },
    { key: 'earnings', label: 'Earnings' }
  ]), []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <h2 style={{ color: accent, fontWeight: 700, margin: 0 }}>{vendor.shopName || 'Vendor Dashboard'}</h2>
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
            <div style={{ marginBottom: 10, color: '#666' }}>
              Tip: Propose a quote first; then Accept or Reject. Once in progress, use Start Repair / Mark Completed.
            </div>
            <OrdersList vendor={vendor} filter={statusFilter} onAction={() => {}} />
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
            <OrdersList vendor={vendor} filter={statusFilter} onAction={() => {}} />
          </>
        )}
        {tab === 'earnings' && (
          <>
            <div style={sectionTitle}>Earnings</div>
            <Earnings vendor={vendor} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('login'); // login | signup | dashboard
  const [vendor, setVendor] = usePersisted('vendor_app_vendor', null);

  useEffect(() => {
    if (vendor?._id) setView('dashboard');
  }, [vendor?._id]);

  const logout = () => {
    setVendor(null);
    setView('login');
  };

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: font }}>
      <div style={{ maxWidth: 780, margin: '36px auto', background: cardBg, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}`, padding: 24 }}>
        {view === 'login' && <Login onFoundVendor={(v) => { setVendor(v); setView('dashboard'); }} goSignup={() => setView('signup')} />}
        {view === 'signup' && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <button type="button" onClick={() => setView('login')} style={{ background: 'transparent', color: accent, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                ← Back to Login
              </button>
            </div>
            <VendorSignup onSuccess={() => setView('login')} />
          </div>
        )}
        {view === 'dashboard' && vendor && <VendorDashboard vendor={vendor} onLogout={logout} />}
      </div>
    </div>
  );
}
