import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color1: '#667eea',
      color2: '#764ba2'
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: GraduationCap,
      color1: '#f093fb',
      color2: '#f5576c'
    },
    {
      title: 'Total Classes',
      value: stats?.totalClasses || 0,
      icon: BookOpen,
      color1: '#4facfe',
      color2: '#00f2fe'
    },
    {
      title: 'Fees Collected',
      value: `RWF ${stats?.totalFeeCollected?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color1: '#43e97b',
      color2: '#38f9d7'
    },
  ];

  const chartData = stats?.monthlyData || [];

  const pieData = [
    { name: 'Students', value: stats?.totalStudents || 0, color: '#667eea' },
    { name: 'Teachers', value: stats?.totalTeachers || 0, color: '#f5576c' },
    { name: 'Classes', value: stats?.totalClasses || 0, color: '#4facfe' },
  ];

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your school today.</p>
        </div>

        <div className="grid grid-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: card.color1 }}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">{card.title}</h3>
                </div>
                <div className="stat-number">{card.value}</div>
              </div>
            );
          })}
        </div>

        {stats?.pendingVerifications > 0 && (
          <div className="alert alert-warning">
            <AlertCircle size={20} />
            <span>
              You have <strong>{stats.pendingVerifications}</strong> pending device verification{stats.pendingVerifications > 1 ? 's' : ''}.
              <a href="/verifications" style={{ marginLeft: '10px', color: 'inherit', fontWeight: 'bold' }}>Review now →</a>
            </span>
          </div>
        )}

        <div className="grid grid-2" style={{ marginTop: '24px' }}>
          {chartData.length > 0 && (
            <div className="card chart-card">
              <div className="chart-header">
                <h2 className="chart-title">Student Enrollment</h2>
                <p className="chart-subtitle">Monthly trend overview</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      fontSize: '13px',
                      padding: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorStudents)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="card chart-card">
              <div className="chart-header">
                <h2 className="chart-title">Fee Collections</h2>
                <p className="chart-subtitle">Revenue by month</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      fontSize: '13px',
                      padding: '12px'
                    }}
                    formatter={(value) => `RWF ${value.toLocaleString()}`}
                  />
                  <Bar 
                    dataKey="fees" 
                    fill="#43e97b" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-2" style={{ marginTop: '24px' }}>
          {pieData.some(item => item.value > 0) && (
            <div className="card chart-card">
              <div className="chart-header">
                <h2 className="chart-title">Distribution</h2>
                <p className="chart-subtitle">System overview</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ 
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    padding: '12px'
                  }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Quick Stats</h2>
              <p className="chart-subtitle">Key metrics</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <div className="quick-stat-item">
                <div className="quick-stat-icon" style={{ background: '#667eea' }}>
                  <Users size={20} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="quick-stat-label">Active Students</div>
                  <div className="quick-stat-value">{stats?.totalStudents || 0}</div>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon" style={{ background: '#f5576c' }}>
                  <GraduationCap size={20} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="quick-stat-label">Teaching Staff</div>
                  <div className="quick-stat-value">{stats?.totalTeachers || 0}</div>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon" style={{ background: '#43e97b' }}>
                  <CheckCircle size={20} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="quick-stat-label">Pending Verifications</div>
                  <div className="quick-stat-value">{stats?.pendingVerifications || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card chart-card" style={{ marginTop: '24px' }}>
          <div className="chart-header">
            <h2 className="chart-title">Recent Transactions</h2>
            <p className="chart-subtitle">Latest payment activities</p>
          </div>
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((txn) => (
                    <tr key={txn._id}>
                      <td style={{ fontWeight: '600', color: '#111827' }}>{txn.studentId?.studentId || 'N/A'}</td>
                      <td>
                        <span className={`badge ${txn.type === 'deposit' ? 'badge-success' : 'badge-danger'}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#111827' }}>
                        RWF {txn.amount.toLocaleString()}
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '13px' }}>
                        {new Date(txn.transactionDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <DollarSign size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <p className="empty-state-text">No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const quickStatStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  borderRadius: '12px',
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
};

const quickStatIconStyle = (color) => ({
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 6px -1px ${color}40`,
});

export default Dashboard;
