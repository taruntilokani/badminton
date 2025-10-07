import React, { useState } from 'react';
import CustomerManagement from './CustomerManagement';
import VendorManagement from './VendorManagement';
import RiderManagement from './RiderManagement';

const accent = '#1976d2';
const border = '#e0e0e0';

function UserManagement() {
  const [selectedSubTab, setSelectedSubTab] = useState('customers');

  const subTabButtonStyle = (tabName) => ({
    background: selectedSubTab === tabName ? accent : '#f0f0f0',
    color: selectedSubTab === tabName ? '#fff' : '#333',
    border: `1px solid ${border}`,
    borderRadius: '8px 8px 0 0',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 16,
    marginRight: 4,
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: selectedSubTab === tabName ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
  });

  return (
    <div>
      <h3 style={{ color: accent, fontWeight: 600, margin: '20px 0' }}>User Management</h3>
      <div style={{ display: 'flex', borderBottom: `2px solid ${accent}`, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setSelectedSubTab('customers')}
          style={subTabButtonStyle('customers')}
        >
          Customers
        </button>
        <button
          type="button"
          onClick={() => setSelectedSubTab('vendors')}
          style={subTabButtonStyle('vendors')}
        >
          Vendors
        </button>
        <button
          type="button"
          onClick={() => setSelectedSubTab('riders')}
          style={subTabButtonStyle('riders')}
        >
          Riders
        </button>
      </div>

      {selectedSubTab === 'customers' && <CustomerManagement />}
      {selectedSubTab === 'vendors' && <VendorManagement />}
      {selectedSubTab === 'riders' && <RiderManagement />}
    </div>
  );
}

export default UserManagement;
