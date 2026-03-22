import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';

function Students() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
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
                      <td style={{ padding: '12px' }}>{student.classId?.name || 'Not assigned'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        RWF {student.feeBalance.toLocaleString()}
                      </td>
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
      </div>
    </>
  );
}

export default Students;
