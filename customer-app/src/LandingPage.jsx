import React, { useState } from 'react';

const labelStyle = { display: 'block', fontSize: 13, color: '#333', marginBottom: 6 };
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  outline: 'none',
  background: '#fff'
};
const primaryBtn = {
  width: '100%',
  marginTop: 16,
  padding: '10px 12px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};

function LandingPage({ setView, onServiceSelect }) {
  const [sport, setSport] = useState('');
  const [serviceType, setServiceType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sport && serviceType) {
      onServiceSelect({ sport, serviceType });
      setView('submit');
    } else {
      alert('Please select both a sport and a service type.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ margin: 0, marginBottom: 12, color: '#1a1a1a', fontSize: 18 }}>Select Your Service</h2>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Sport</label>
        <select
          style={{ ...inputStyle, height: 40 }}
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          required
        >
          <option value="">Select a sport</option>
          <option value="Badminton">Badminton</option>
          <option value="Tennis">Tennis</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Service Type</label>
        <select
          style={{ ...inputStyle, height: 40 }}
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          required
        >
          <option value="">Select a service</option>
          <option value="Grip replacement">Grip replacement</option>
          <option value="Racket repair">Racket repair</option>
          <option value="Racket string repair">Racket string repair</option>
        </select>
      </div>

      <button type="submit" style={primaryBtn}>Proceed to Request</button>
      <button type="button" style={{ ...primaryBtn, background: '#555', marginTop: 8 }} onClick={() => setView('home')}>Back to Home</button>
    </form>
  );
}

export default LandingPage;
