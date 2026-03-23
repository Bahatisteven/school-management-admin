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
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getPendingVerifications();
      console.log('Pending verifications response:', response);
      setPending(response.data);
    } catch (error) {
      console.error('Error loading verifications:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(error.response?.data?.error || 'Failed to load pending verifications');
      }
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
        <div className="page-header">
          <h1>Device Verifications</h1>
          <p>Review and approve device access requests</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="card">
            <div className="loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading verifications...</div>
            </div>
          </div>
        ) : (
          <div className="card chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Pending Verifications</h2>
              <p className="chart-subtitle">{pending.length} device(s) awaiting approval</p>
            </div>

            {pending.length > 0 ? (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {pending.map((item) => (
                  <div
                    key={item.user.id}
                    className="verification-card"
                  >
                    <div className="verification-header">
                      <div className="verification-user-info">
                        <div className="verification-avatar">
                          {item.user.firstName?.charAt(0)}{item.user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="verification-name">
                            {item.user.firstName} {item.user.lastName}
                          </h3>
                          <p className="verification-detail">
                            <strong>Email:</strong> {item.user.email}
                          </p>
                          <p className="verification-detail">
                            <strong>Role:</strong> <span className="badge badge-info">{item.user.role}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="verification-devices">
                      <h4 className="devices-title">Pending Devices:</h4>
                      {item.pendingDevices.map((device) => (
                        <div
                          key={device.deviceId}
                          className="device-item"
                        >
                          <div className="device-info">
                            <svg className="device-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="device-name"><strong>{device.deviceName}</strong></p>
                              <p className="device-date">
                                Added: {new Date(device.addedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleVerify(item.user.id, device.deviceId)}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg style={{ width: '48px', height: '48px', opacity: 0.2, marginBottom: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="empty-state-text">No pending verifications</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Verifications;
