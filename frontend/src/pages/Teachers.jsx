import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';
import { useAuth } from '../utils/AuthContext';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    subjects: '',
    qualification: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await adminService.getTeachers();
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s !== ''),
      };
      await adminService.createTeacher(payload);
      setSuccess('Teacher created successfully');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        subjects: '',
        qualification: '',
      });
      setShowForm(false);
      loadTeachers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating teacher');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Teachers</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card mb-6">
          {isAdmin && (
            <div className="flex justify-between items-center mb-4">
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Create New Teacher'}
              </button>
            </div>
          )}

          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-2">
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 chars, uppercase, lowercase, number"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+250..."
                  />
                </div>
                <div className="input-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Subjects (comma separated)</label>
                  <input
                    type="text"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="Mathematics, Physics, Chemistry"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>Create Teacher</button>
            </form>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : teachers.length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Teacher ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Subjects</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Assigned Classes</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{teacher.teacherId}</td>
                    <td style={{ padding: '12px' }}>
                      {teacher.userId?.firstName} {teacher.userId?.lastName}
                    </td>
                    <td style={{ padding: '12px' }}>{teacher.userId?.email}</td>
                    <td style={{ padding: '12px' }}>{teacher.subjects?.join(', ') || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {teacher.assignedClasses?.map((c) => c.name).join(', ') || 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No teachers found</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Teachers;
