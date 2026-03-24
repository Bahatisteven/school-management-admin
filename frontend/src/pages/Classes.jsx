import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService, academicService } from '../services';
import { useAuth } from '../utils/AuthContext';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTeacherAssign, setShowTeacherAssign] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showViewSchedule, setShowViewSchedule] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [classStudents, setClassStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    students: []
  });
  const [gradeData, setGradeData] = useState({
    subject: '',
    examType: 'quiz',
    term: 'Term 1',
    academicYear: new Date().getFullYear().toString(),
    students: []
  });

  const handleOpenGrades = async (cls) => {
    setSelectedClass(cls);
    setLoading(true);
    try {
      const response = await adminService.getStudents(1, '');
      const classId = cls._id || cls.id;
      const filtered = response.data.students.filter(s => 
        (s.classId?._id || s.classId?.id || s.classId) === classId
      );
      setClassStudents(filtered);
      setGradeData({
        ...gradeData,
        students: filtered.map(s => ({
          studentId: s._id || s.id,
          score: 0,
          remarks: ''
        }))
      });
      setShowGradeModal(true);
    } catch (err) {
      setError('Error loading students for grades');
    } finally {
      setLoading(false);
    }
  };

  const calculateLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const submitGrades = async () => {
    setLoading(true);
    try {
      const promises = gradeData.students.map(s => 
        academicService.addGrade({
          studentId: s.studentId,
          classId: selectedClass._id || selectedClass.id,
          subject: gradeData.subject,
          score: s.score,
          grade: calculateLetterGrade(s.score),
          examType: gradeData.examType,
          term: gradeData.term,
          academicYear: gradeData.academicYear,
          remarks: s.remarks
        })
      );
      
      await Promise.all(promises);
      setSuccess('Grades recorded successfully!');
      setShowGradeModal(false);
      setSelectedClass(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving grades');
    } finally {
      setLoading(false);
    }
  };
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
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

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

  const handleOpenAttendance = async (cls) => {
    setSelectedClass(cls);
    setLoading(true);
    try {
      // Get students for this specific class - assuming there might be an endpoint or we filter
      const response = await adminService.getStudents(1, '');
      const classId = cls._id || cls.id;
      const filtered = response.data.students.filter(s => 
        (s.classId?._id || s.classId?.id || s.classId) === classId
      );
      setClassStudents(filtered);
      setAttendanceData({
        date: new Date().toISOString().split('T')[0],
        students: filtered.map(s => ({
          studentId: s._id || s.id,
          status: 'present',
          remarks: ''
        }))
      });
      setShowAttendanceModal(true);
    } catch (err) {
      setError('Error loading students for attendance');
    } finally {
      setLoading(false);
    }
  };

  const submitAttendance = async () => {
    setLoading(true);
    try {
      await academicService.recordAttendance({
        classId: selectedClass._id || selectedClass.id,
        date: attendanceData.date,
        students: attendanceData.students
      });
      setSuccess('Attendance marked successfully!');
      setShowAttendanceModal(false);
      setSelectedClass(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Classes</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card mb-6">
          {isAdmin && (
            <button className="btn btn-primary mb-4" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Create New Class'}
            </button>
          )}

          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="mt-4">
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
                  
                  <div className="mt-3">
                    <strong>Teacher:</strong>{' '}
                    {cls.teacherId ? (
                      <span style={{ color: '#10b981', fontWeight: '600' }}>
                        {cls.teacherId.firstName} {cls.teacherId.lastName}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>Not assigned</span>
                    )}
                  </div>

                  {cls.schedule && cls.schedule.length > 0 && (
                    <p className="mt-2"><strong>Schedule:</strong> {cls.schedule.length} slots</p>
                  )}
                  
                  {!isAdmin && (
                    <div className="mt-4" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowViewSchedule(true);
                        }}
                      >
                        View Schedule
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className="btn btn-success btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleOpenAttendance(cls)}
                        >
                          Mark Attendance
                        </button>
                        <button 
                          className="btn btn-info btn-sm"
                          style={{ flex: 1, background: '#3b82f6' }}
                          onClick={() => handleOpenGrades(cls)}
                        >
                          Add Grades
                        </button>
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className={cls.teacherId ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}
                          onClick={() => {
                            setSelectedClass(cls);
                            setSelectedTeacher(cls.teacherId?._id || cls.teacherId?.id || '');
                            setShowTeacherAssign(true);
                          }}
                        >
                          {cls.teacherId ? 'Change Teacher' : 'Assign Teacher'}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedClass(cls);
                            setShowScheduleForm(true);
                          }}
                        >
                          Add Schedule
                        </button>
                      </div>
                    </div>
                  )}
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

        {/* View Schedule Modal */}
        {showViewSchedule && selectedClass && (
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
            <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
              <div className="flex justify-between items-center mb-4">
                <h3>Schedule: {selectedClass.name}</h3>
                <button 
                  onClick={() => setShowViewSchedule(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              {selectedClass.schedule && selectedClass.schedule.length > 0 ? (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Subject</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass.schedule.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.day}</strong></td>
                          <td>{item.subject}</td>
                          <td>{item.startTime} - {item.endTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4">No schedule set for this class.</p>
              )}

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  onClick={() => setShowViewSchedule(false)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark Attendance Modal */}
        {showAttendanceModal && selectedClass && (
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
            <div className="card" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3>Mark Attendance: {selectedClass.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>Select date and mark status for each student</p>
                </div>
                <button 
                  onClick={() => setShowAttendanceModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <label>Attendance Date:</label>
                <input 
                  type="date" 
                  value={attendanceData.date}
                  onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                  style={{ marginLeft: '10px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>

              {classStudents.length > 0 ? (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student, idx) => {
                        const studentRecord = attendanceData.students.find(s => s.studentId === (student._id || student.id));
                        return (
                          <tr key={student._id || student.id}>
                            <td>{student.userId?.firstName} {student.userId?.lastName}</td>
                            <td>{student.studentId}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                {['present', 'absent', 'late'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      const updatedStudents = [...attendanceData.students];
                                      const index = updatedStudents.findIndex(s => s.studentId === (student._id || student.id));
                                      updatedStudents[index].status = status;
                                      setAttendanceData({ ...attendanceData, students: updatedStudents });
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      borderRadius: '4px',
                                      border: '1px solid',
                                      cursor: 'pointer',
                                      textTransform: 'capitalize',
                                      backgroundColor: studentRecord?.status === status 
                                        ? (status === 'present' ? '#10b981' : status === 'absent' ? '#ef4444' : '#f59e0b')
                                        : 'white',
                                      color: studentRecord?.status === status ? 'white' : '#6b7280',
                                      borderColor: studentRecord?.status === status 
                                        ? 'transparent' 
                                        : '#d1d5db'
                                    }}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px' }}>No students found in this class.</p>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAttendance}
                  className="btn btn-success"
                  disabled={classStudents.length === 0}
                >
                  Submit Attendance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Grades Modal */}
        {showGradeModal && selectedClass && (
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
            <div className="card" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3>Add Grades: {selectedClass.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>Enter grades for each student</p>
                </div>
                <button 
                  onClick={() => setShowGradeModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-2" style={{ gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label>Subject:</label>
                  <input 
                    type="text" 
                    value={gradeData.subject}
                    onChange={(e) => setGradeData({ ...gradeData, subject: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
                <div>
                  <label>Exam Type:</label>
                  <select 
                    value={gradeData.examType}
                    onChange={(e) => setGradeData({ ...gradeData, examType: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
                <div>
                  <label>Term:</label>
                  <input 
                    type="text" 
                    value={gradeData.term}
                    onChange={(e) => setGradeData({ ...gradeData, term: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    placeholder="e.g., Term 1"
                  />
                </div>
                <div>
                  <label>Academic Year:</label>
                  <input 
                    type="text" 
                    value={gradeData.academicYear}
                    onChange={(e) => setGradeData({ ...gradeData, academicYear: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              {classStudents.length > 0 ? (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th style={{ textAlign: 'center', width: '120px' }}>Score (0-100)</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student, idx) => {
                        const studentGrade = gradeData.students.find(s => s.studentId === (student._id || student.id));
                        return (
                          <tr key={student._id || student.id}>
                            <td>{student.userId?.firstName} {student.userId?.lastName}</td>
                            <td>{student.studentId}</td>
                            <td>
                              <input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={studentGrade?.score || 0}
                                onChange={(e) => {
                                  const updatedStudents = [...gradeData.students];
                                  const index = updatedStudents.findIndex(s => s.studentId === (student._id || student.id));
                                  updatedStudents[index].score = parseFloat(e.target.value) || 0;
                                  setGradeData({ ...gradeData, students: updatedStudents });
                                }}
                                style={{ 
                                  width: '100%', 
                                  padding: '6px', 
                                  textAlign: 'center',
                                  borderRadius: '4px',
                                  border: '1px solid #d1d5db'
                                }}
                              />
                            </td>
                            <td>
                              <input 
                                type="text" 
                                value={studentGrade?.remarks || ''}
                                onChange={(e) => {
                                  const updatedStudents = [...gradeData.students];
                                  const index = updatedStudents.findIndex(s => s.studentId === (student._id || student.id));
                                  updatedStudents[index].remarks = e.target.value;
                                  setGradeData({ ...gradeData, students: updatedStudents });
                                }}
                                style={{ 
                                  width: '100%', 
                                  padding: '6px',
                                  borderRadius: '4px',
                                  border: '1px solid #d1d5db'
                                }}
                                placeholder="Optional remarks"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px' }}>No students found in this class.</p>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={submitGrades}
                  className="btn btn-primary"
                  disabled={classStudents.length === 0 || !gradeData.subject}
                >
                  Submit Grades
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Classes;
