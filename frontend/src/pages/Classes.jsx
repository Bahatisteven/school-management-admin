import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    capacity: 30,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await adminService.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.createClass(formData);
      setSuccess('Class created successfully');
      setFormData({
        name: '',
        grade: '',
        section: '',
        academicYear: new Date().getFullYear().toString(),
        capacity: 30,
      });
      setShowForm(false);
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating class');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Classes</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create New Class'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="grid grid-2">
                <div className="input-group">
                  <label>Class Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Grade</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">Create Class</button>
            </form>
          )}
        </div>

        <div className="card">
          <h2>All Classes</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : classes.length > 0 ? (
            <div className="grid grid-3" style={{ marginTop: '20px' }}>
              {classes.map((cls) => (
                <div key={cls._id} className="card" style={{ background: '#f9fafb' }}>
                  <h3>{cls.name}</h3>
                  <p><strong>Grade:</strong> {cls.grade}</p>
                  {cls.section && <p><strong>Section:</strong> {cls.section}</p>}
                  <p><strong>Academic Year:</strong> {cls.academicYear}</p>
                  <p><strong>Capacity:</strong> {cls.capacity}</p>
                  {cls.teacherId && (
                    <p><strong>Teacher:</strong> {cls.teacherId.firstName} {cls.teacherId.lastName}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '20px' }}>No classes found</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Classes;
