# School Management System - Admin Application

A full-stack administrative web application for managing school operations including students, teachers, classes, fees, and academic records. Built with Node.js, Express, React, and MongoDB with enterprise-grade security.

## Overview

This admin application provides centralized control over the school management system. Administrators can manage users, verify devices, oversee academic records, monitor fee transactions, and generate reports through an intuitive dashboard interface.

## Core Features

**Dashboard Analytics**
- Real-time statistics (students, teachers, classes, fees)
- Pending device verification alerts
- Recent transaction history

**User Management**
- View and search all students and teachers
- Paginated data views with filtering
- Device verification approval workflow

**Class Management**
- Create, update, and delete classes
- Assign teachers to classes
- Manage class schedules and capacity

**Fee Administration**
- Monitor all fee transactions (deposits/withdrawals)
- Filter by transaction type and status
- Track student balances

**Academic Oversight**
- View student grades and attendance
- Generate attendance reports by date range
- Filter academic data by class

**Device Verification**
- Review pending device requests
- Approve or reject device access
- Full device registration audit trail

## Tech Stack

**Backend**
- Node.js v16+ with Express.js v5.2.1
- MongoDB v7.0 with Mongoose ODM
- JWT authentication with device verification
- Password security: SHA-512 pre-hash + bcrypt (12 rounds)
- Validation: express-validator, Joi
- Security: Helmet, express-rate-limit, mongo-sanitize, hpp
- API Documentation: Swagger UI

**Frontend**
- React v19.2.4 with Vite v8.0.1
- React Router v7.13.1
- Axios for HTTP requests
- Context API for state management
- Recharts for data visualization
- Custom CSS styling

**DevOps**
- Docker & Docker Compose
- Nginx for production
- MongoDB 7.0 containerized

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB v5+
- npm or yarn

### Local Development

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your settings
npm run dev
```

Backend runs on http://localhost:5001

2. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5001/api
npm run dev
```

Frontend runs on http://localhost:5174

3. **Create Admin User**
```bash
cd backend
node setup-admin.js
```

Default credentials:
- Email: admin@school.com
- Password: Admin@123

### Docker Deployment

```bash
# Create .env file with required variables
docker-compose up -d

# Create admin user
docker exec -it admin-backend node setup-admin.js
```

Services:
- Frontend: http://localhost:5174
- Backend: http://localhost:5001
- MongoDB: port 27017

## Environment Variables

**Backend (.env)**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/school_management_shared
JWT_SECRET=your_secure_secret_key_minimum_32_chars
TOKEN_EXPIRY=24h
CLIENT_URL=http://localhost:5174
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5001/api
```

## API Endpoints

**Authentication**
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get profile

**Admin Operations**
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/students` - List students (paginated)
- `GET /api/admin/teachers` - List teachers
- `GET /api/admin/classes` - List classes
- `POST /api/admin/classes` - Create class
- `PUT /api/admin/classes/:id` - Update class
- `DELETE /api/admin/classes/:id` - Delete class
- `POST /api/admin/assign-teacher` - Assign teacher
- `GET /api/admin/fee-transactions` - List transactions
- `GET /api/admin/pending-verifications` - Pending devices
- `POST /api/admin/verify-device` - Verify device

All endpoints require:
- Authorization: Bearer {token}
- X-Device-ID: {device-id}

API Documentation: http://localhost:5001/api-docs

## Project Structure

```
school-management-admin/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & constants
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, validation, errors
│   │   ├── dtos/           # Data transfer objects
│   │   └── utils/          # Helper functions
│   ├── setup-admin.js      # Admin creation script
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Auth context
│   │   └── styles/         # CSS files
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Security Features

- **Authentication**: JWT tokens with 24-hour expiry
- **Password Hashing**: SHA-512 + bcrypt (12 rounds)
- **Device Verification**: Admin-approved device access
- **Role-Based Access**: Admin-only endpoints
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: All inputs validated and sanitized
- **HTTP Security**: Helmet.js headers, CORS protection
- **NoSQL Injection**: mongo-sanitize middleware
- **DTOs**: Sensitive data filtered from responses

## Database Schemas

**User** - Authentication and device management  
**Student** - Student profiles and fee balances  
**Teacher** - Teacher profiles and class assignments  
**Class** - Class details and schedules  
**Grade** - Academic grades by subject and term  
**Attendance** - Daily attendance records  
**FeeTransaction** - Fee deposits and withdrawals  
**Notification** - System notifications  

## Key Implementation Details

**Device Verification Workflow**
1. User logs in with auto-generated device ID
2. Device stored as "pending verification"
3. Admin reviews and approves in Verifications page
4. User gains system access after approval
5. Multiple devices per user supported

**Data Transfer Objects (DTOs)**
- All API responses use DTOs
- Sensitive fields (passwords, internal IDs) excluded
- Consistent structure across endpoints

**Shared Database**
- Admin and Client apps share the same MongoDB database
- Ensures data consistency across applications
- Single source of truth for all entities

## Troubleshooting

**Cannot login as admin**
```bash
cd backend
node check-admin.js  # Verify admin exists
node reset-admin.js  # Reset password if needed
```

**MongoDB connection failed**
```bash
# Check if MongoDB is running
sudo systemctl status mongod
sudo systemctl start mongod
```

**Port already in use**
```bash
# Find process using port 5001
lsof -i :5001
# Change PORT in .env or kill the process
```

**Device not verified**
- Login as admin
- Navigate to Verifications page
- Approve pending device

## Production Deployment

**Backend**
1. Set strong JWT_SECRET (min 32 characters)
2. Use production MongoDB URI (MongoDB Atlas recommended)
3. Enable HTTPS
4. Configure proper CORS origins
5. Use PM2 for process management
6. Set up monitoring and logging

**Frontend**
1. Build: `npm run build`
2. Serve with Nginx
3. Enable HTTPS
4. Configure CDN (optional)

**Security Checklist**
- Change all default credentials
- Enable MongoDB authentication
- Use environment variables for secrets
- Set NODE_ENV=production
- Configure firewall rules
- Set up automated backups

## Design Decisions

- **Layered Architecture**: Routes → Controllers → Services → Models
- **JWT over Sessions**: Stateless authentication for scalability
- **DTOs**: Prevent sensitive data exposure
- **Device Verification**: Enhanced security for multi-device access
- **Shared Database**: Data consistency between admin and client apps

## License

ISC

## Support

For technical support or questions, refer to the API documentation at `/api-docs` or contact the development team.

---
