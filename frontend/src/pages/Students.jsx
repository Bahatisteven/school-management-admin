import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';
import { useAuth } from '../utils/AuthContext';

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, [search]);

  const loadStudents = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getStudents(page, search);
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await adminService.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleAssignClass = async () => {
    if (!assigningStudent || assignLoading) return;
    
    setAssignLoading(true);
    try {
      const result = await adminService.assignStudentToClass(
        assigningStudent._id,
        selectedClass || null
      );
      alert(selectedClass ? 'Student assigned to class successfully!' : 'Student removed from class successfully!');
      setAssigningStudent(null);
      setSelectedClass('');
      loadStudents(pagination?.page || 1);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to assign student to class';
      console.error('Assign student error:', error.response?.data);
      alert('Error: ' + errorMsg);
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Students</h1>

        <div className="card">
          <input
            type="text"
            placeholder="Search by Student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
          />

          {loading ? (
            <div className="loading">Loading...</div>
          ) : students.length > 0 ? (
            <>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Class</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Fee Balance</th>
                    {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{student.studentId}</td>
                      <td style={{ padding: '12px' }}>
                        {student.userId?.firstName} {student.userId?.lastName}
                      </td>
                      <td style={{ padding: '12px' }}>{student.userId?.email}</td>
                      <td style={{ padding: '12px' }}>
                        {student.classId?.name || <span style={{ color: '#999' }}>Not assigned</span>}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        RWF {student.feeBalance.toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {student.classId ? (
                            <div style={{ color: '#10b981', fontWeight: '600' }}>
                              {student.classId.name}
                              <button
                                onClick={() => {
                                  setAssigningStudent(student);
                                  setSelectedClass(student.classId?._id || student.classId?.id || '');
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '10px' }}
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAssigningStudent(student);
                                setSelectedClass('');
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              Assign Class
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination && pagination.pages > 1 && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => loadStudents(page)}
                      className={page === pagination.page ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ margin: '0 5px' }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p>No students found</p>
          )}
        </div>

        {/* Assign Class Modal */}
        {assigningStudent && (
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
              <h3>Assign Student to Class</h3>
              <p style={{ marginBottom: '20px' }}>
                Student: <strong>{assigningStudent.userId?.firstName} {assigningStudent.userId?.lastName}</strong>
                <br />
                Student ID: <strong>{assigningStudent.studentId}</strong>
              </p>

              <div className="form-group">
                <label>Select Class:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                >
                  <option value="">-- Remove from class --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - Grade {cls.grade} {cls.section ? `(${cls.section})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setAssigningStudent(null);
                    setSelectedClass('');
                  }}
                  className="btn btn-secondary"
                  disabled={assignLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignClass}
                  className="btn btn-primary"
                  disabled={assignLoading}
                >
                  {assignLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Students;
