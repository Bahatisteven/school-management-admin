import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Teachers</h1>

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
