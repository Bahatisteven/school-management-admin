import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminService.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container"><div className="loading">Loading...</div></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Dashboard</h1>

        <div className="grid grid-3">
          <div className="card">
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>Total Students</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4f46e5' }}>
              {stats?.totalStudents || 0}
            </p>
          </div>

          <div className="card">
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>Total Teachers</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
              {stats?.totalTeachers || 0}
            </p>
          </div>

          <div className="card">
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>Total Classes</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats?.totalClasses || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: '20px' }}>
          <div className="card">
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>Pending Verifications</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>
              {stats?.pendingVerifications || 0}
            </p>
          </div>

          <div className="card">
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>Total Fees Collected</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6' }}>
              RWF {stats?.totalFeeCollected?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Recent Transactions</h2>
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((txn) => (
                  <tr key={txn._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{txn.studentId?.studentId || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: txn.type === 'deposit' ? '#d1fae5' : '#fee2e2',
                        color: txn.type === 'deposit' ? '#065f46' : '#991b1b',
                      }}>
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      RWF {txn.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                      {new Date(txn.transactionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent transactions</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
