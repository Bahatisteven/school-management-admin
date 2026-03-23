const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management System API - Admin',
      version: '1.0.0',
      description: `
# School Management System API Documentation

Complete API documentation for the Admin Backend system.

## Features
- Authentication with device verification
- Fee management (deposits/withdrawals)
- Academic records management
- Class and teacher administration
- Real-time notifications

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
X-Device-ID: <your-device-id>
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@schoolmanagement.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Admin Backend',
      },
      {
        url: 'http://localhost:5002',
        description: 'Client Backend',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and device verification' },
      { name: 'Fees', description: 'Fee management operations' },
      { name: 'Academic', description: 'Grades, attendance, and timetables' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'Notifications', description: 'User notifications' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        deviceId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Device-ID',
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

// API endpoints documentation
swaggerSpec.paths = {
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'firstName', 'lastName', 'role'],
              properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'Password123' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                role: { type: 'string', enum: ['student', 'parent'] },
                phoneNumber: { type: 'string', example: '+250788123456' },
                dateOfBirth: { type: 'string', format: 'date' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Registration successful' },
        400: { description: 'Validation error' },
        409: { description: 'Email already registered' },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'deviceId'],
              properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                deviceId: { type: 'string' },
                deviceName: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Login successful' },
        401: { description: 'Invalid credentials' },
        403: { description: 'Device not verified' },
      },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Current user data' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/fees/deposit': {
    post: {
      tags: ['Fees'],
      summary: 'Deposit fee payment',
      security: [{ bearerAuth: [], deviceId: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', example: 50000 },
                description: { type: 'string' },
                childStudentId: { type: 'string', description: 'Required for parents' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Deposit successful' },
        400: { description: 'Validation error' },
      },
    },
  },
  '/api/fees/withdraw': {
    post: {
      tags: ['Fees'],
      summary: 'Request withdrawal/refund',
      security: [{ bearerAuth: [], deviceId: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number' },
                description: { type: 'string' },
                childStudentId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Withdrawal successful' },
        400: { description: 'Insufficient balance' },
      },
    },
  },
  '/api/fees/balance': {
    get: {
      tags: ['Fees'],
      summary: 'Get fee balance',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Balance retrieved' },
      },
    },
  },
  '/api/fees/history': {
    get: {
      tags: ['Fees'],
      summary: 'Get transaction history',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Transaction history' },
      },
    },
  },
  '/api/academic/grades': {
    get: {
      tags: ['Academic'],
      summary: 'Get student grades',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Grades retrieved' },
      },
    },
    post: {
      tags: ['Academic'],
      summary: 'Add grade (Teacher only)',
      security: [{ bearerAuth: [], deviceId: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['studentId', 'classId', 'subject', 'score', 'examType', 'term', 'academicYear'],
              properties: {
                studentId: { type: 'string' },
                classId: { type: 'string' },
                subject: { type: 'string' },
                score: { type: 'number', minimum: 0, maximum: 100 },
                examType: { type: 'string', enum: ['quiz', 'midterm', 'final', 'assignment'] },
                term: { type: 'string', enum: ['1', '2', '3'] },
                academicYear: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Grade added' },
        403: { description: 'Teacher access required' },
      },
    },
  },
  '/api/academic/attendance': {
    get: {
      tags: ['Academic'],
      summary: 'Get attendance records',
      security: [{ bearerAuth: [], deviceId: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: { description: 'Attendance records' },
      },
    },
    post: {
      tags: ['Academic'],
      summary: 'Record attendance (Teacher only)',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        201: { description: 'Attendance recorded' },
      },
    },
  },
  '/api/academic/timetable': {
    get: {
      tags: ['Academic'],
      summary: 'Get timetable',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Timetable retrieved' },
      },
    },
  },
  '/api/admin/dashboard': {
    get: {
      tags: ['Admin'],
      summary: 'Get dashboard stats (Admin only)',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Dashboard statistics' },
        403: { description: 'Admin access required' },
      },
    },
  },
  '/api/admin/students': {
    get: {
      tags: ['Admin'],
      summary: 'Get all students (Admin only)',
      security: [{ bearerAuth: [], deviceId: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Students list' },
      },
    },
  },
  '/api/admin/classes': {
    get: {
      tags: ['Admin'],
      summary: 'Get all classes (Admin only)',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Classes list' },
      },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create class (Admin only)',
      security: [{ bearerAuth: [], deviceId: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'grade', 'academicYear'],
              properties: {
                name: { type: 'string' },
                grade: { type: 'string' },
                section: { type: 'string' },
                academicYear: { type: 'string' },
                capacity: { type: 'number' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Class created' },
      },
    },
  },
  '/api/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notifications',
      security: [{ bearerAuth: [], deviceId: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'unreadOnly', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: { description: 'Notifications list' },
      },
    },
  },
  '/api/notifications/unread-count': {
    get: {
      tags: ['Notifications'],
      summary: 'Get unread count',
      security: [{ bearerAuth: [], deviceId: [] }],
      responses: {
        200: { description: 'Unread count' },
      },
    },
  },
  '/api/notifications/{id}/read': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark as read',
      security: [{ bearerAuth: [], deviceId: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Marked as read' },
      },
    },
  },
  '/api/health': {
    get: {
      tags: ['System'],
      summary: 'Health check',
      responses: {
        200: { description: 'System healthy' },
      },
    },
  },
};

module.exports = swaggerSpec;
