import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';

function Verifications() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      const response = await adminService.getPendingVerifications();
      setPending(response.data);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, deviceId) => {
    setError('');
    setSuccess('');

    try {
      await adminService.verifyDevice(userId, deviceId);
      setSuccess('Device verified successfully');
      loadPendingVerifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Error verifying device');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Device Verifications</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <h2>Pending Verifications ({pending.length})</h2>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : pending.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              {pending.map((item) => (
                <div
                  key={item.user.id}
                  style={{
                    padding: '20px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <h3 style={{ marginBottom: '10px' }}>
                    {item.user.firstName} {item.user.lastName}
                  </h3>
                  <p><strong>Email:</strong> {item.user.email}</p>
                  <p><strong>Role:</strong> {item.user.role}</p>

                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#6b7280' }}>Pending Devices:</h4>
                    {item.pendingDevices.map((device) => (
                      <div
                        key={device.deviceId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px',
                          background: 'white',
                          borderRadius: '4px',
                          marginBottom: '10px',
                        }}
                      >
                        <div>
                          <p><strong>Device:</strong> {device.deviceName}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>
                            Added: {new Date(device.addedAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          className="btn btn-success"
                          onClick={() => handleVerify(item.user.id, device.deviceId)}
                        >
                          Verify
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '20px' }}>No pending verifications</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Verifications;
