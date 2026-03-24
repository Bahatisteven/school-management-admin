import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTeacherAssign, setShowTeacherAssign] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    capacity: 30,
  });
  const [scheduleData, setScheduleData] = useState({
    day: 'Monday',
    subject: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await adminService.getTeachers();
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

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

  const handleAssignTeacher = async () => {
    if (!selectedClass || !selectedTeacher) {
      alert('Please select a teacher');
      return;
    }
    
    try {
      const result = await adminService.assignTeacher(selectedTeacher, selectedClass._id);
      alert('Teacher assigned successfully!');
      setSuccess('Teacher assigned successfully!');
      setShowTeacherAssign(false);
      setSelectedClass(null);
      setSelectedTeacher('');
      loadClasses();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error assigning teacher';
      alert('Error: ' + errorMsg);
      setError(errorMsg);
      console.error('Assign teacher error:', err.response?.data);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const updatedSchedule = [...(selectedClass.schedule || []), {
        ...scheduleData,
        teacherId: selectedClass.teacherId?._id || null
      }];
      
      await adminService.updateClass(selectedClass._id, { schedule: updatedSchedule });
      setSuccess('Schedule added successfully!');
      setScheduleData({ day: 'Monday', subject: '', startTime: '', endTime: '' });
      setShowScheduleForm(false);
      setSelectedClass(null);
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding schedule');
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
                  {cls.schedule && cls.schedule.length > 0 && (
                    <p><strong>Schedule:</strong> {cls.schedule.length} slots</p>
                  )}
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                      onClick={() => {
                        setSelectedClass(cls);
                        setSelectedTeacher(cls.teacherId?._id || '');
                        setShowTeacherAssign(true);
                      }}
                    >
                      Assign Teacher
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                      onClick={() => {
                        setSelectedClass(cls);
                        setShowScheduleForm(true);
                      }}
                    >
                      Add Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '20px' }}>No classes found</p>
          )}
        </div>

        {/* Assign Teacher Modal */}
        {showTeacherAssign && selectedClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
              <h3>Assign Teacher to {selectedClass.name}</h3>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Select Teacher:</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.userId?.firstName} {teacher.userId?.lastName} - {teacher.subjects?.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowTeacherAssign(false);
                    setSelectedClass(null);
                    setSelectedTeacher('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTeacher}
                  className="btn btn-primary"
                  disabled={!selectedTeacher}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Schedule Modal */}
        {showScheduleForm && selectedClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
              <h3>Add Schedule to {selectedClass.name}</h3>
              
              <form onSubmit={handleAddSchedule} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>Day:</label>
                  <select
                    value={scheduleData.day}
                    onChange={(e) => setScheduleData({ ...scheduleData, day: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                    required
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Subject:</label>
                  <input
                    type="text"
                    value={scheduleData.subject}
                    onChange={(e) => setScheduleData({ ...scheduleData, subject: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                    required
                  />
                </div>

                <div className="grid grid-2" style={{ marginTop: '10px', gap: '10px' }}>
                  <div className="form-group">
                    <label>Start Time:</label>
                    <input
                      type="time"
                      value={scheduleData.startTime}
                      onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time:</label>
                    <input
                      type="time"
                      value={scheduleData.endTime}
                      onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setSelectedClass(null);
                      setScheduleData({ day: 'Monday', subject: '', startTime: '', endTime: '' });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Classes;
