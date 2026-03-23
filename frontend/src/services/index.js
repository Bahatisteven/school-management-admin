import api from './api';

export const authService = {
  login: async (email, password) => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      //  pre-verified admin device ID for admin users
      deviceId = email === 'admin@school.com' ? 'admin-device-001' : 
        'device_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('deviceId', deviceId);
    }
    const deviceName = 'Admin Panel';
    
    const response = await api.post('/auth/login', {
      email,
      password,
      deviceId,
      deviceName,
    });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getStudents: async (page = 1, search = '') => {
    const response = await api.get('/admin/students', { params: { page, search } });
    return response.data;
  },

  getTeachers: async (page = 1) => {
    const response = await api.get('/admin/teachers', { params: { page } });
    return response.data;
  },

  getClasses: async () => {
    const response = await api.get('/admin/classes');
    return response.data;
  },

  createClass: async (classData) => {
    const response = await api.post('/admin/classes', classData);
    return response.data;
  },

  updateClass: async (id, classData) => {
    const response = await api.put(`/admin/classes/${id}`, classData);
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await api.delete(`/admin/classes/${id}`);
    return response.data;
  },

  assignTeacher: async (teacherId, classId) => {
    const response = await api.post('/admin/assign-teacher', { teacherId, classId });
    return response.data;
  },

  getFeeTransactions: async (page = 1, filters = {}) => {
    const response = await api.get('/admin/fee-transactions', { params: { page, ...filters } });
    return response.data;
  },

  getAttendanceReport: async (classId, startDate, endDate) => {
    const response = await api.get('/admin/attendance-report', {
      params: { classId, startDate, endDate },
    });
    return response.data;
  },

  getPendingVerifications: async () => {
    const response = await api.get('/admin/pending-verifications');
    return response.data;
  },

  verifyDevice: async (userId, deviceId) => {
    const response = await api.post('/admin/verify-device', { userId, deviceId });
    return response.data;
  },
};
