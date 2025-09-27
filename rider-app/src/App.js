import React, { useEffect, useState } from 'react';
import RiderSignup from './RiderSignup';
import RiderLogin from './RiderLogin';
import RiderDashboard from './RiderDashboard';

const mainBg = '#f4f6fb';
const cardBg = '#fff';
const accent = '#1976d2';
const border = '#e0e0e0';
const font = 'Segoe UI, Arial, sans-serif';

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

function App() {
  const [view, setView] = useState('login'); // login | signup | dashboard
  const [rider, setRider] = usePersisted('rider_app_rider', null);

  useEffect(() => {
    if (rider?._id) setView('dashboard');
  }, [rider?._id]);

  const logout = () => {
    setRider(null);
    setView('login');
  };

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: font, padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 780, margin: '36px auto', background: cardBg, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}`, padding: 24 }}>
        {view === 'login' && <RiderLogin onFoundRider={(r) => { setRider(r); setView('dashboard'); }} goSignup={() => setView('signup')} />}
        {view === 'signup' && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <button type="button" onClick={() => setView('login')} style={{ background: 'transparent', color: accent, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                ← Back to Login
              </button>
            </div>
            <RiderSignup onSuccess={() => setView('login')} />
          </div>
        )}
        {view === 'dashboard' && rider && <RiderDashboard rider={rider} onLogout={logout} />}
      </div>
    </div>
  );
}

export default App;
