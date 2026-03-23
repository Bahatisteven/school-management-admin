# School Management System - Admin Application

Comprehensive admin panel for managing students, teachers, classes, fees, and device verifications in the school management system.

## Features

### Dashboard
- Total students, teachers, and classes statistics
- Pending device verifications count
- Total fees collected
- Recent transaction history

### User Management
- View all students with detailed information
- View all teachers and their assignments
- Verify user devices for system access
- Manage user roles and permissions

### Class Management
- Create new classes
- Update class information
- Delete classes
- Assign teachers to classes
- View class schedules

### Fee Management
- View all fee transactions
- Filter by transaction type and status
- Monitor student fee balances
- Track payment history

### Device Verification
- Review pending device verification requests
- Approve or reject device access
- Track device registration history

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT authentication
- bcryptjs for password hashing
- express-validator for input validation
- Helmet for security
- express-rate-limit for rate limiting

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API calls
- Context API for state management

## Project Structure

```
school-management-admin/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   │   └── adminController.js    # Admin-specific operations
│   │   ├── services/
│   │   │   └── adminService.js       # Admin business logic
│   │   ├── routes/
│   │   │   └── adminRoutes.js        # Admin API routes
│   │   ├── middlewares/
│   │   ├── dtos/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Students.jsx
    │   │   ├── Teachers.jsx
    │   │   ├── Classes.jsx
    │   │   ├── Fees.jsx
    │   │   └── Verifications.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── index.js
    │   ├── utils/
    │   │   └── AuthContext.jsx
    │   ├── styles/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Admin user account in database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/school_management_admin
JWT_SECRET=your_secure_jwt_secret_key_for_admin
TOKEN_EXPIRY=24h
CLIENT_URL=http://localhost:5174
NODE_ENV=development
```

5. Create admin user:
```bash
# Run the setup script from backend directory
node setup-admin.js
```

This creates an admin user with:
- **Email:** admin@school.com
- **Password:** Admin@123
- **Device ID:** admin-device-001

6. Start the server:
```bash
npm run dev
```

Backend runs on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

5. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5174`

6. Build for production:
```bash
npm run build
```

## Admin API Endpoints

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### Student Management
- `GET /api/admin/students?page=1&search=` - Get all students (paginated)

### Teacher Management
- `GET /api/admin/teachers?page=1` - Get all teachers (paginated)

### Class Management
- `GET /api/admin/classes` - Get all classes
- `POST /api/admin/classes` - Create new class
- `PUT /api/admin/classes/:id` - Update class
- `DELETE /api/admin/classes/:id` - Delete class
- `POST /api/admin/assign-teacher` - Assign teacher to class

### Fee Management
- `GET /api/admin/fee-transactions?page=1&type=&status=` - Get all transactions

### Attendance Reports
- `GET /api/admin/attendance-report?classId=&startDate=&endDate=` - Get attendance report

### Device Verification
- `GET /api/admin/pending-verifications` - Get pending device verifications
- `POST /api/admin/verify-device` - Verify user device

## Usage

### First Time Setup

1. Start MongoDB
2. Start backend server
3. Create admin user in database
4. Start frontend
5. Login with admin credentials

### Creating a Class

1. Navigate to "Classes" page
2. Click "Create New Class"
3. Fill in class details:
   - Name (e.g., "Grade 5A")
   - Grade (e.g., "5")
   - Section (optional)
   - Academic Year
   - Capacity
4. Click "Create Class"

### Verifying User Devices

1. Navigate to "Verifications" page
2. Review pending device requests
3. Check user details and device information
4. Click "Verify" to approve device access
5. User can now login from verified device

### Managing Students

1. Navigate to "Students" page
2. View all registered students
3. Search by Student ID
4. View student details:
   - Personal information
   - Assigned class
   - Fee balance
5. Pagination available for large datasets

### Monitoring Fees

1. Navigate to "Fees" page
2. View all fee transactions
3. Filter by:
   - Transaction type (deposit/withdraw)
   - Status (completed/pending/rejected)
4. Monitor payment patterns

## Security Features

- Admin-only access (role-based authorization)
- JWT authentication required for all endpoints
- Device ID verification for all users
- Secure password storage (bcrypt)
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Key Assumptions

1. Admin users must be created directly in database
2. All API endpoints require authentication
3. Device verification applies to all users including admins
4. Classes are uniquely identified by name
5. One teacher can be assigned to multiple classes
6. Fee transactions are immutable once created
7. Student-class relationship is one-to-one

## Database Schemas

### User
- email, password (hashed), firstName, lastName
- role (admin, teacher, student, parent)
- deviceIds[] with verification status
- isActive, lastLogin

### Student
- userId (ref User), studentId (unique)
- classId (ref Class)
- feeBalance, dateOfBirth, address

### Teacher
- userId (ref User), teacherId (unique)
- assignedClasses[] (ref Class)
- subjects[], qualification, hireDate

### Class
- name (unique), grade, section
- teacherId (ref Teacher)
- academicYear, capacity
- schedule[] (day, subject, startTime, endTime, teacherId)

### FeeTransaction
- studentId (ref Student)
- type (deposit/withdraw)
- amount, description, status
- balanceAfter, transactionDate, processedBy

### Grade
- studentId, classId, subject
- score, grade, term, academicYear
- examType, teacherId, remarks

### Attendance
- studentId, classId, date
- status (present/absent/late/excused)
- recordedBy (ref Teacher), remarks

## Troubleshooting

### Cannot login as admin
- Verify admin user exists in database
- Check role is set to "admin"
- Ensure password is correctly hashed
- Verify device ID is registered and verified

### Classes not loading
- Check MongoDB connection
- Verify admin authentication token
- Check browser console for errors

### Device verification not working
- Ensure device ID is being sent in headers
- Check user's deviceIds array in database
- Verify admin has permission to verify devices

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Enable HTTPS
5. Set proper CORS origins
6. Use process manager (PM2)
7. Configure logging
8. Set up monitoring

### Frontend
1. Build production bundle: `npm run build`
2. Serve with Nginx or similar
3. Configure environment variables
4. Enable HTTPS
5. Set up CDN (optional)
6. Configure error tracking

## Admin Best Practices

1. **Regular Monitoring**: Check dashboard daily for system health
2. **Device Verification**: Review and process requests promptly
3. **Class Management**: Keep class assignments up to date
4. **Fee Oversight**: Monitor unusual transaction patterns
5. **Security**: Regularly review user access and permissions
6. **Data Backup**: Ensure regular database backups
7. **Audit Logs**: Review system logs for anomalies

## Support

For technical support or questions, contact the development team.

## License

ISC
