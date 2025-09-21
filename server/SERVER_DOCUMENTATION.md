# TeraMotors Auto Repair Shop - Backend Server Documentation

## Overview
This document outlines the complete backend server implementation needed for the TeraMotors Auto Repair Shop management system. The frontend is built with Next.js and currently uses API routes, but we need a dedicated Express.js backend server to handle all business logic, database operations, and API endpoints.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **File Upload**: Multer for handling file uploads
- **Email**: Nodemailer for email notifications
- **Real-time**: Socket.io for real-time updates
- **Validation**: Joi for request validation
- **ZATCA Compliance**: Custom implementation for Saudi e-invoicing
- **Security**: Helmet, rate limiting, input sanitization
- **Performance**: Compression, caching, query optimization
- **Environment**: dotenv for environment variables

## Project Structure
```
backend/
├── src/
│   ├── controllers/          # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── zatca/               # ZATCA e-invoicing implementation
│   └── security/            # Security utilities
├── uploads/                 # File upload directory
├── logs/                    # Application logs
├── tests/                   # Test files
├── package.json
├── server.js               # Main server file
└── .env.example           # Environment variables template
```

## Database Models

### 1. User Model
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  fullName: String,
  role: String (enum: ['admin', 'mechanic', 'inspector'], default: 'mechanic'),
  phone: String,
  isActive: Boolean (default: true),
  emailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Customer Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  vehicles: [ObjectId] (ref: 'Vehicle'),
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Vehicle Model
```javascript
{
  customerId: ObjectId (ref: 'Customer'),
  vin: String (unique),
  make: String (required),
  model: String (required),
  year: Number (required, min: 1900, max: current year + 1),
  color: String,
  licensePlate: String (required, unique),
  mileage: Number (min: 0),
  engineType: String,
  transmission: String (enum: ['manual', 'automatic', 'cvt']),
  fuelType: String (enum: ['gasoline', 'diesel', 'hybrid', 'electric']),
  photos: [String],
  serviceHistory: [{
    serviceId: ObjectId (ref: 'Service'),
    date: Date,
    mileage: Number,
    cost: Number,
    notes: String
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Part Model
```javascript
{
  name: String (required),
  description: String,
  category: String (required),
  manufacturer: String,
  cost: Number (required),
  sellingPrice: Number (required),
  stockQuantity: Number (required, min: 0),
  minStockLevel: Number (required, min: 0),
  location: String,
  partNumber: String (required, unique),
  compatibleVehicles: [{
    make: String,
    model: String,
    year: Number
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Service Model
```javascript
{
  name: String (required),
  description: String,
  category: String (required),
  laborRate: Number (required),
  laborHours: Number (required, min: 0),
  partsRequired: [{
    partId: ObjectId (ref: 'Part'),
    quantity: Number (required, min: 1),
    cost: Number (required, min: 0)
  }],
  isActive: Boolean (default: true),
  isTemplate: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Appointment Model
```javascript
{
  customerId: ObjectId (ref: 'Customer', required),
  vehicleId: ObjectId (ref: 'Vehicle', required),
  serviceId: ObjectId (ref: 'Service', required),
  appointmentDate: Date (required),
  startTime: Date (required),
  endTime: Date (required),
  status: String (enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled'),
  notes: String,
  estimatedCost: Number (required, min: 0),
  actualCost: Number (min: 0),
  mechanicId: ObjectId (ref: 'User', required),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. JobCard Model
```javascript
{
  appointmentId: ObjectId (ref: 'Appointment', required),
  customerId: ObjectId (ref: 'Customer', required),
  vehicleId: ObjectId (ref: 'Vehicle', required),
  mechanicId: ObjectId (ref: 'User', required),
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending'),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  estimatedStartTime: Date (required),
  estimatedEndTime: Date (required),
  actualStartTime: Date,
  actualEndTime: Date,
  laborHours: Number (required, min: 0),
  partsUsed: [{
    partId: ObjectId (ref: 'Part'),
    quantity: Number (required, min: 1),
    cost: Number (required, min: 0)
  }],
  notes: String,
  photos: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Estimate Model
```javascript
{
  jobCardId: ObjectId (ref: 'JobCard', required),
  customerId: ObjectId (ref: 'Customer', required),
  vehicleId: ObjectId (ref: 'Vehicle', required),
  mechanicId: ObjectId (ref: 'User', required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  notes: String,
  services: [{
    serviceId: ObjectId (ref: 'Service'),
    quantity: Number (required, min: 1),
    laborCost: Number (required, min: 0),
    partsCost: Number (required, min: 0),
    totalCost: Number (required, min: 0)
  }],
  subtotal: Number (required, min: 0),
  tax: Number (required, min: 0),
  total: Number (required, min: 0),
  validUntil: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Invoice Model
```javascript
{
  jobCardId: ObjectId (ref: 'JobCard', required),
  customerId: ObjectId (ref: 'Customer', required),
  vehicleId: ObjectId (ref: 'Vehicle', required),
  mechanicId: ObjectId (ref: 'User', required),
  status: String (enum: ['pending', 'paid', 'cancelled'], default: 'pending'),
  notes: String,
  totalAmount: Number (required, min: 0),
  paidAmount: Number (min: 0),
  dueDate: Date (required),
  paymentMethod: String (enum: ['cash', 'card', 'bank_transfer', 'other']),
  paymentStatus: String (enum: ['pending', 'paid', 'failed'], default: 'pending'),
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. VehicleInspection Model
```javascript
{
  vehicleId: ObjectId (ref: 'Vehicle', required),
  customerId: ObjectId (ref: 'Customer', required),
  mechanicId: ObjectId (ref: 'User', required),
  templateId: ObjectId (ref: 'InspectionTemplate', required),
  inspectionDate: Date (required),
  mileage: Number (required),
  overallCondition: String (required),
  items: [{
    itemId: String (required),
    condition: String (enum: ['good', 'fair', 'poor', 'critical'], required),
    notes: String,
    photos: [String],
    recommendations: String,
    estimatedCost: Number (min: 0),
    priority: String (enum: ['critical', 'safety', 'recommended', 'optional'], required)
  }],
  totalEstimatedCost: Number (required, min: 0),
  recommendations: String,
  nextInspectionDate: Date,
  status: String (enum: ['in-progress', 'completed', 'cancelled'], default: 'in-progress'),
  createdAt: Date,
  updatedAt: Date
}
```

### 11. InspectionTemplate Model
```javascript
{
  name: String (required),
  vehicleType: String (enum: ['sedan', 'suv', 'truck', 'motorcycle'], required),
  category: String (required),
  items: [{
    id: String (required),
    name: String (required),
    description: String,
    category: String (required),
    isRequired: Boolean (default: true),
    defaultCondition: String
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-email` - Verify email address
- `POST /request-verify` - Request email verification
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile

### User Management Routes (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (admin only)

### Customer Routes (`/api/customers`)
- `GET /` - Get all customers with search/filter
- `POST /` - Create new customer
- `GET /:id` - Get customer by ID
- `PUT /:id` - Update customer
- `DELETE /:id` - Delete customer
- `POST /:id/notify` - Send notification to customer
- `GET /export` - Export customers to CSV/Excel
- `POST /import` - Import customers from file

### Vehicle Routes (`/api/vehicles`)
- `GET /` - Get all vehicles with search/filter
- `POST /` - Create new vehicle
- `GET /:id` - Get vehicle by ID
- `PUT /:id` - Update vehicle
- `DELETE /:id` - Delete vehicle
- `GET /export` - Export vehicles to CSV/Excel
- `POST /import` - Import vehicles from file

### Part Routes (`/api/parts`)
- `GET /` - Get all parts with search/filter
- `POST /` - Create new part
- `GET /:id` - Get part by ID
- `PUT /:id` - Update part
- `DELETE /:id` - Delete part
- `GET /compatible` - Get compatible parts for vehicle
- `GET /low-stock` - Get parts with low stock
- `POST /:id/usage` - Record part usage

### Service Routes (`/api/services`)
- `GET /` - Get all services with search/filter
- `POST /` - Create new service
- `GET /:id` - Get service by ID
- `PUT /:id` - Update service
- `DELETE /:id` - Delete service
- `GET /categories` - Get service categories

### Appointment Routes (`/api/appointments`)
- `GET /` - Get all appointments with filters
- `POST /` - Create new appointment
- `GET /:id` - Get appointment by ID
- `PUT /:id` - Update appointment
- `DELETE /:id` - Delete appointment
- `GET /available-slots` - Get available time slots
- `POST /:id/reminders` - Send appointment reminders

### Job Card Routes (`/api/job-cards`)
- `GET /` - Get all job cards
- `POST /` - Create new job card
- `GET /:id` - Get job card by ID
- `PUT /:id` - Update job card
- `DELETE /:id` - Delete job card
- `PUT /:id/status` - Update job card status
- `POST /:id/photos` - Upload job card photos
- `PUT /:id/time` - Update start/end times

### Estimate Routes (`/api/estimates`)
- `GET /` - Get all estimates
- `POST /` - Create new estimate
- `GET /:id` - Get estimate by ID
- `PUT /:id` - Update estimate
- `DELETE /:id` - Delete estimate
- `PUT /:id/status` - Update estimate status
- `GET /:id/pdf` - Generate PDF estimate

### Invoice Routes (`/api/invoices`)
- `GET /` - Get all invoices
- `POST /` - Create new invoice
- `GET /:id` - Get invoice by ID
- `PUT /:id` - Update invoice
- `DELETE /:id` - Delete invoice

### Inspection Routes (`/api/inspections`)
- `GET /` - Get all inspections
- `POST /` - Create new inspection
- `GET /:id` - Get inspection by ID
- `PUT /:id` - Update inspection
- `DELETE /:id` - Delete inspection

### Inspection Template Routes (`/api/inspection-templates`)
- `GET /` - Get all inspection templates
- `POST /` - Create new template
- `GET /:id` - Get template by ID
- `PUT /:id` - Update template
- `DELETE /:id` - Delete template

### Dashboard Routes (`/api/dashboard`)
- `GET /stats` - Get dashboard statistics

### Report Routes (`/api/reports`)
- `GET /` - Get available reports
- `GET /inventory` - Generate inventory report

### File Upload Routes (`/api/upload`)
- `POST /` - Upload files (images, documents)

### Utility Routes
- `GET /test-connection` - Test database connection
- `GET /test-db` - Test database operations

## Socket.io Real-time Implementation

### Socket.io Server Setup

#### 1. Server Configuration (`server.js`)
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join user to role-based rooms
  socket.join(`role_${socket.userRole}`);
  socket.join(`user_${socket.userId}`);
  
  // Join specific rooms based on user role
  if (socket.userRole === 'admin') {
    socket.join('admin_room');
  }
  
  // Handle appointment updates
  socket.on('join_appointment', (appointmentId) => {
    socket.join(`appointment_${appointmentId}`);
  });
  
  // Handle job card updates
  socket.on('join_jobcard', (jobCardId) => {
    socket.join(`jobcard_${jobCardId}`);
  });
  
  // Handle customer updates
  socket.on('join_customer', (customerId) => {
    socket.join(`customer_${customerId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

module.exports = { io };
```

#### 2. Socket.io Events and Handlers (`src/services/socketService.js`)
```javascript
const { io } = require('../server');

class SocketService {
  // Appointment Events
  static appointmentCreated(appointment) {
    io.to('admin_room').emit('appointment_created', appointment);
    io.to(`customer_${appointment.customerId}`).emit('appointment_scheduled', appointment);
  }
  
  static appointmentUpdated(appointment) {
    io.to(`appointment_${appointment._id}`).emit('appointment_updated', appointment);
    io.to(`customer_${appointment.customerId}`).emit('appointment_updated', appointment);
  }
  
  static appointmentCancelled(appointment) {
    io.to(`appointment_${appointment._id}`).emit('appointment_cancelled', appointment);
    io.to(`customer_${appointment.customerId}`).emit('appointment_cancelled', appointment);
  }
  
  // Job Card Events
  static jobCardCreated(jobCard) {
    io.to('admin_room').emit('jobcard_created', jobCard);
    io.to(`customer_${jobCard.customerId}`).emit('job_started', jobCard);
  }
  
  static jobCardStatusUpdated(jobCard) {
    io.to(`jobcard_${jobCard._id}`).emit('jobcard_status_updated', jobCard);
    io.to(`customer_${jobCard.customerId}`).emit('job_status_updated', jobCard);
    
    // Notify mechanics
    io.to('role_mechanic').emit('jobcard_updated', jobCard);
  }
  
  static jobCardProgressUpdated(jobCard) {
    io.to(`jobcard_${jobCard._id}`).emit('jobcard_progress_updated', jobCard);
    io.to(`customer_${jobCard.customerId}`).emit('job_progress_updated', jobCard);
  }
  
  // Estimate Events
  static estimateCreated(estimate) {
    io.to(`customer_${estimate.customerId}`).emit('estimate_created', estimate);
    io.to('admin_room').emit('estimate_created', estimate);
  }
  
  static estimateStatusUpdated(estimate) {
    io.to(`customer_${estimate.customerId}`).emit('estimate_status_updated', estimate);
    io.to('admin_room').emit('estimate_status_updated', estimate);
  }
  
  // Invoice Events
  static invoiceCreated(invoice) {
    io.to(`customer_${invoice.customerId}`).emit('invoice_created', invoice);
    io.to('admin_room').emit('invoice_created', invoice);
  }
  
  static invoicePaid(invoice) {
    io.to(`customer_${invoice.customerId}`).emit('invoice_paid', invoice);
    io.to('admin_room').emit('invoice_paid', invoice);
  }
  
  // Inventory Events
  static partStockLow(part) {
    io.to('admin_room').emit('part_stock_low', part);
    io.to('role_mechanic').emit('part_stock_low', part);
  }
  
  static partStockUpdated(part) {
    io.to('admin_room').emit('part_stock_updated', part);
  }
  
  // Customer Events
  static customerUpdated(customer) {
    io.to(`customer_${customer._id}`).emit('customer_updated', customer);
    io.to('admin_room').emit('customer_updated', customer);
  }
  
  // Vehicle Events
  static vehicleUpdated(vehicle) {
    io.to(`customer_${vehicle.customerId}`).emit('vehicle_updated', vehicle);
    io.to('admin_room').emit('vehicle_updated', vehicle);
  }
  
  // Inspection Events
  static inspectionCompleted(inspection) {
    io.to(`customer_${inspection.customerId}`).emit('inspection_completed', inspection);
    io.to('admin_room').emit('inspection_completed', inspection);
  }
  
  // Dashboard Events
  static dashboardStatsUpdated(stats) {
    io.to('admin_room').emit('dashboard_stats_updated', stats);
  }
  
  // Notification Events
  static sendNotification(userId, notification) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
  
  static sendBroadcastNotification(notification) {
    io.emit('broadcast_notification', notification);
  }
  
  // Real-time Chat (if needed)
  static messageSent(roomId, message) {
    io.to(`chat_${roomId}`).emit('message', message);
  }
  
  // System Events
  static systemMaintenance(maintenance) {
    io.emit('system_maintenance', maintenance);
  }
  
  static systemAlert(alert) {
    io.emit('system_alert', alert);
  }
}

module.exports = SocketService;
```

#### 3. Integration with Controllers (`src/controllers/appointmentController.js`)
```javascript
const SocketService = require('../services/socketService');

// Example: Create appointment with real-time notification
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    
    // Emit real-time event
    SocketService.appointmentCreated(appointment);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Example: Update appointment status with real-time notification
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    // Emit real-time event
    SocketService.appointmentUpdated(appointment);
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

#### 4. Frontend Socket.io Client Setup
```javascript
// Frontend: src/lib/socket.js
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }
  
  connect(token) {
    this.socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      auth: {
        token: token
      }
    });
    
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to server');
    });
    
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from server');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  // Join specific rooms
  joinAppointment(appointmentId) {
    if (this.socket) {
      this.socket.emit('join_appointment', appointmentId);
    }
  }
  
  joinJobCard(jobCardId) {
    if (this.socket) {
      this.socket.emit('join_jobcard', jobCardId);
    }
  }
  
  joinCustomer(customerId) {
    if (this.socket) {
      this.socket.emit('join_customer', customerId);
    }
  }
  
  // Event listeners
  onAppointmentCreated(callback) {
    if (this.socket) {
      this.socket.on('appointment_created', callback);
    }
  }
  
  onAppointmentUpdated(callback) {
    if (this.socket) {
      this.socket.on('appointment_updated', callback);
    }
  }
  
  onJobCardStatusUpdated(callback) {
    if (this.socket) {
      this.socket.on('jobcard_status_updated', callback);
    }
  }
  
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }
  
  onDashboardStatsUpdated(callback) {
    if (this.socket) {
      this.socket.on('dashboard_stats_updated', callback);
    }
  }
}

export default new SocketClient();
```

#### 5. Real-time Features Implementation

##### A. Live Dashboard Updates
```javascript
// Backend: Update dashboard stats and emit
const updateDashboardStats = async () => {
  const stats = await calculateDashboardStats();
  SocketService.dashboardStatsUpdated(stats);
};

// Frontend: Listen for dashboard updates
useEffect(() => {
  socketClient.onDashboardStatsUpdated((stats) => {
    setDashboardStats(stats);
  });
}, []);
```

##### B. Live Job Board
```javascript
// Backend: Emit job card updates
SocketService.jobCardStatusUpdated(jobCard);

// Frontend: Update job board in real-time
useEffect(() => {
  socketClient.onJobCardStatusUpdated((jobCard) => {
    setJobCards(prev => 
      prev.map(jc => jc._id === jobCard._id ? jobCard : jc)
    );
  });
}, []);
```

##### C. Live Appointment Calendar
```javascript
// Backend: Emit appointment updates
SocketService.appointmentUpdated(appointment);

// Frontend: Update calendar in real-time
useEffect(() => {
  socketClient.onAppointmentUpdated((appointment) => {
    setAppointments(prev => 
      prev.map(apt => apt._id === appointment._id ? appointment : apt)
    );
  });
}, []);
```

##### D. Real-time Notifications
```javascript
// Backend: Send notifications
SocketService.sendNotification(userId, {
  type: 'appointment_reminder',
  title: 'Appointment Reminder',
  message: 'Your appointment is in 30 minutes',
  timestamp: new Date()
});

// Frontend: Handle notifications
useEffect(() => {
  socketClient.onNotification((notification) => {
    showToast(notification.message);
    addNotification(notification);
  });
}, []);
```

##### E. Inventory Alerts
```javascript
// Backend: Check stock levels and emit alerts
const checkStockLevels = async () => {
  const lowStockParts = await Part.find({
    stockQuantity: { $lte: '$minStockLevel' }
  });
  
  lowStockParts.forEach(part => {
    SocketService.partStockLow(part);
  });
};

// Frontend: Handle stock alerts
useEffect(() => {
  socketClient.on('part_stock_low', (part) => {
    showAlert(`Low stock alert: ${part.name} (${part.stockQuantity} remaining)`);
  });
}, []);
```

#### 6. Socket.io Rooms and Namespaces

##### A. Room Structure
```javascript
// User-specific rooms
`user_${userId}` - Individual user notifications
`role_${role}` - Role-based notifications (admin, mechanic, inspector)

// Entity-specific rooms
`appointment_${appointmentId}` - Appointment updates
`jobcard_${jobCardId}` - Job card updates
`customer_${customerId}` - Customer updates
`vehicle_${vehicleId}` - Vehicle updates

// System rooms
`admin_room` - Admin-only notifications
`mechanic_room` - Mechanic notifications
`chat_${roomId}` - Chat rooms
```

##### B. Namespace Configuration
```javascript
// Admin namespace
const adminNamespace = io.of('/admin');
adminNamespace.use(adminAuthMiddleware);

// Customer namespace
const customerNamespace = io.of('/customer');
customerNamespace.use(customerAuthMiddleware);
```

#### 7. Socket.io Middleware and Security

##### A. Authentication Middleware
```javascript
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return next(new Error('Unauthorized'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};
```

##### B. Rate Limiting
```javascript
const rateLimit = require('socket.io-rate-limit');

io.use(rateLimit({
  windowMs: 1000,
  max: 10,
  message: 'Too many requests'
}));
```

#### 8. Socket.io Event Types

##### A. Appointment Events
- `appointment_created` - New appointment scheduled
- `appointment_updated` - Appointment details changed
- `appointment_cancelled` - Appointment cancelled
- `appointment_reminder` - Appointment reminder sent
- `appointment_completed` - Appointment finished

##### B. Job Card Events
- `jobcard_created` - New job card created
- `jobcard_status_updated` - Job status changed
- `jobcard_progress_updated` - Job progress updated
- `jobcard_completed` - Job finished
- `jobcard_photos_added` - Photos added to job

##### C. Customer Events
- `customer_updated` - Customer info updated
- `customer_notification` - Notification sent to customer
- `customer_message` - Message from customer

##### D. Inventory Events
- `part_stock_low` - Low stock alert
- `part_stock_updated` - Stock level changed
- `part_ordered` - Part ordered
- `part_received` - Part received

##### E. System Events
- `dashboard_stats_updated` - Dashboard data refreshed
- `system_maintenance` - System maintenance notice
- `system_alert` - System alert
- `broadcast_notification` - Broadcast to all users

## ZATCA E-Invoicing Implementation

### ZATCA Compliance Overview
ZATCA (Zakat, Tax and Customs Authority) requires all businesses in Saudi Arabia to implement e-invoicing. This implementation covers both Phase 1 (QR code generation) and Phase 2 (XML submission).

### ZATCA Implementation Structure
```
src/zatca/
├── phase1/                 # Phase 1 implementation
│   ├── qrGenerator.js     # QR code generation
│   ├── invoiceHash.js     # Invoice hash calculation
│   └── validation.js      # Phase 1 validation
├── phase2/                 # Phase 2 implementation
│   ├── xmlGenerator.js    # XML invoice generation
│   ├── digitalSignature.js # Digital signature
│   ├── submission.js      # ZATCA API submission
│   └── validation.js      # Phase 2 validation
├── utils/                  # ZATCA utilities
│   ├── certificateManager.js # Certificate management
│   ├── encryption.js      # Encryption utilities
│   └── helpers.js         # Helper functions
└── config/                 # ZATCA configuration
    ├── constants.js       # ZATCA constants
    └── endpoints.js       # API endpoints
```

### Phase 1 Implementation (QR Code Generation)

#### 1. QR Code Generator (`src/zatca/phase1/qrGenerator.js`)
```javascript
const QRCode = require('qrcode');
const crypto = require('crypto');

class ZATCAQRGenerator {
  static generateQRCode(invoiceData) {
    const qrData = this.formatQRData(invoiceData);
    return QRCode.toDataURL(qrData);
  }

  static formatQRData(invoice) {
    const data = {
      sellerName: invoice.seller.name,
      vatNumber: invoice.seller.vatNumber,
      invoiceDate: invoice.date,
      invoiceTotal: invoice.total,
      vatTotal: invoice.vatAmount,
      invoiceHash: this.generateInvoiceHash(invoice)
    };

    return JSON.stringify(data);
  }

  static generateInvoiceHash(invoice) {
    const hashString = `${invoice.seller.name}|${invoice.seller.vatNumber}|${invoice.date}|${invoice.total}|${invoice.vatAmount}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }
}

module.exports = ZATCAQRGenerator;
```

#### 2. Invoice Hash Calculator (`src/zatca/phase1/invoiceHash.js`)
```javascript
const crypto = require('crypto');

class InvoiceHashCalculator {
  static calculateHash(invoiceData) {
    const sortedData = this.sortInvoiceData(invoiceData);
    const dataString = this.concatenateData(sortedData);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  static sortInvoiceData(data) {
    return Object.keys(data)
      .sort()
      .reduce((result, key) => {
        result[key] = data[key];
        return result;
      }, {});
  }

  static concatenateData(data) {
    return Object.values(data).join('|');
  }
}

module.exports = InvoiceHashCalculator;
```

### Phase 2 Implementation (XML Submission)

#### 1. XML Generator (`src/zatca/phase2/xmlGenerator.js`)
```javascript
const xml2js = require('xml2js');

class ZATCAXMLGenerator {
  static generateXML(invoiceData) {
    const xmlStructure = this.buildXMLStructure(invoiceData);
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    });

    return builder.buildObject(xmlStructure);
  }

  static buildXMLStructure(invoice) {
    return {
      Invoice: {
        $: {
          xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
          'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
          'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
        },
        'cbc:ID': invoice.invoiceNumber,
        'cbc:IssueDate': invoice.date,
        'cbc:InvoiceTypeCode': invoice.type,
        'cbc:DocumentCurrencyCode': 'SAR',
        'cac:AccountingSupplierParty': this.buildSupplierData(invoice.seller),
        'cac:AccountingCustomerParty': this.buildCustomerData(invoice.customer),
        'cac:TaxTotal': this.buildTaxData(invoice),
        'cac:LegalMonetaryTotal': this.buildMonetaryData(invoice),
        'cac:InvoiceLine': this.buildInvoiceLines(invoice.items)
      }
    };
  }

  static buildSupplierData(seller) {
    return {
      'cac:Party': {
        'cac:PartyName': { 'cbc:Name': seller.name },
        'cac:PartyTaxScheme': {
          'cac:TaxScheme': { 'cbc:ID': seller.vatNumber }
        }
      }
    };
  }

  static buildCustomerData(customer) {
    return {
      'cac:Party': {
        'cac:PartyName': { 'cbc:Name': customer.name },
        'cac:PartyTaxScheme': {
          'cac:TaxScheme': { 'cbc:ID': customer.vatNumber || 'N/A' }
        }
      }
    };
  }

  static buildTaxData(invoice) {
    return {
      'cbc:TaxAmount': invoice.vatAmount,
      'cac:TaxSubtotal': {
        'cbc:TaxableAmount': invoice.subtotal,
        'cbc:TaxAmount': invoice.vatAmount,
        'cac:TaxCategory': {
          'cac:TaxScheme': { 'cbc:ID': 'VAT' }
        }
      }
    };
  }

  static buildMonetaryData(invoice) {
    return {
      'cbc:LineExtensionAmount': invoice.subtotal,
      'cbc:TaxExclusiveAmount': invoice.subtotal,
      'cbc:TaxInclusiveAmount': invoice.total,
      'cbc:PayableAmount': invoice.total
    };
  }

  static buildInvoiceLines(items) {
    return items.map((item, index) => ({
      'cbc:ID': index + 1,
      'cbc:InvoicedQuantity': item.quantity,
      'cbc:LineExtensionAmount': item.total,
      'cac:Item': {
        'cbc:Description': item.description,
        'cbc:SellersItemIdentification': { 'cbc:ID': item.code }
      },
      'cac:Price': {
        'cbc:PriceAmount': item.unitPrice
      }
    }));
  }
}

module.exports = ZATCAXMLGenerator;
```

#### 2. Digital Signature (`src/zatca/phase2/digitalSignature.js`)
```javascript
const crypto = require('crypto');
const forge = require('node-forge');

class DigitalSignature {
  static signXML(xmlContent, privateKey, certificate) {
    try {
      // Create digest
      const digest = crypto.createHash('sha256').update(xmlContent).digest('base64');
      
      // Create signature
      const signature = this.createSignature(digest, privateKey);
      
      // Build signed XML
      return this.buildSignedXML(xmlContent, digest, signature, certificate);
    } catch (error) {
      throw new Error(`Digital signature failed: ${error.message}`);
    }
  }

  static createSignature(digest, privateKey) {
    const pki = forge.pki;
    const privateKeyPem = forge.pki.privateKeyFromPem(privateKey);
    
    const md = forge.md.sha256.create();
    md.update(digest, 'utf8');
    
    return privateKeyPem.sign(md);
  }

  static buildSignedXML(xmlContent, digest, signature, certificate) {
    const signedInfo = `
      <ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha256"/>
        <ds:Reference URI="">
          <ds:Transforms>
            <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          </ds:Transforms>
          <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
          <ds:DigestValue>${digest}</ds:DigestValue>
        </ds:Reference>
      </ds:SignedInfo>
    `;

    return xmlContent.replace('</Invoice>', `
      <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        ${signedInfo}
        <ds:SignatureValue>${signature}</ds:SignatureValue>
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>${certificate}</ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>
      </ds:Signature>
    </Invoice>`);
  }
}

module.exports = DigitalSignature;
```

#### 3. ZATCA API Submission (`src/zatca/phase2/submission.js`)
```javascript
const axios = require('axios');
const FormData = require('form-data');

class ZATCASubmission {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment = config.environment; // 'sandbox' or 'production'
  }

  async submitInvoice(xmlContent, invoiceData) {
    try {
      // Get access token
      const token = await this.getAccessToken();
      
      // Prepare submission data
      const submissionData = this.prepareSubmissionData(xmlContent, invoiceData);
      
      // Submit to ZATCA
      const response = await this.submitToZATCA(submissionData, token);
      
      return this.processResponse(response);
    } catch (error) {
      throw new Error(`ZATCA submission failed: ${error.message}`);
    }
  }

  async getAccessToken() {
    const tokenData = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    const response = await axios.post(`${this.baseURL}/oauth/token`, tokenData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data.access_token;
  }

  prepareSubmissionData(xmlContent, invoiceData) {
    const formData = new FormData();
    
    formData.append('invoice', xmlContent, {
      filename: `invoice_${invoiceData.invoiceNumber}.xml`,
      contentType: 'application/xml'
    });

    formData.append('invoiceHash', invoiceData.hash);
    formData.append('uuid', invoiceData.uuid);

    return formData;
  }

  async submitToZATCA(submissionData, token) {
    const url = this.environment === 'production' 
      ? `${this.baseURL}/invoices`
      : `${this.baseURL}/sandbox/invoices`;

    return await axios.post(url, submissionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...submissionData.getHeaders()
      }
    });
  }

  processResponse(response) {
    return {
      success: response.status === 200,
      uuid: response.data.uuid,
      longId: response.data.longId,
      qrCode: response.data.qrCode,
      warnings: response.data.warnings || [],
      errors: response.data.errors || []
    };
  }
}

module.exports = ZATCASubmission;
```

### ZATCA Integration with Controllers

#### Invoice Controller with ZATCA (`src/controllers/invoiceController.js`)
```javascript
const ZATCAQRGenerator = require('../zatca/phase1/qrGenerator');
const ZATCAXMLGenerator = require('../zatca/phase2/xmlGenerator');
const DigitalSignature = require('../zatca/phase2/digitalSignature');
const ZATCASubmission = require('../zatca/phase2/submission');

exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    
    // Generate ZATCA QR Code (Phase 1)
    const qrCode = ZATCAQRGenerator.generateQRCode(invoice);
    invoice.qrCode = qrCode;
    
    // Generate XML for ZATCA (Phase 2)
    const xmlContent = ZATCAXMLGenerator.generateXML(invoice);
    
    // Sign XML
    const signedXML = DigitalSignature.signXML(
      xmlContent, 
      process.env.ZATCA_PRIVATE_KEY,
      process.env.ZATCA_CERTIFICATE
    );
    
    // Submit to ZATCA
    const zatcaConfig = {
      baseURL: process.env.ZATCA_BASE_URL,
      clientId: process.env.ZATCA_CLIENT_ID,
      clientSecret: process.env.ZATCA_CLIENT_SECRET,
      environment: process.env.NODE_ENV
    };
    
    const zatcaSubmission = new ZATCASubmission(zatcaConfig);
    const submissionResult = await zatcaSubmission.submitInvoice(signedXML, invoice);
    
    // Update invoice with ZATCA data
    invoice.zatcaUUID = submissionResult.uuid;
    invoice.zatcaLongId = submissionResult.longId;
    invoice.zatcaQRCode = submissionResult.qrCode;
    invoice.zatcaStatus = submissionResult.success ? 'submitted' : 'failed';
    
    await invoice.save();
    
    res.status(201).json({
      success: true,
      data: invoice,
      zatca: submissionResult
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

### ZATCA Configuration

#### Environment Variables for ZATCA
```env
# ZATCA Configuration
ZATCA_BASE_URL=https://api.zatca.gov.sa
ZATCA_CLIENT_ID=your_client_id
ZATCA_CLIENT_SECRET=your_client_secret
ZATCA_PRIVATE_KEY=your_private_key_pem
ZATCA_CERTIFICATE=your_certificate_pem
ZATCA_SANDBOX_URL=https://api-sandbox.zatca.gov.sa
```

#### ZATCA Constants (`src/zatca/config/constants.js`)
```javascript
module.exports = {
  ZATCA_PHASES: {
    PHASE_1: 'phase1',
    PHASE_2: 'phase2'
  },
  
  INVOICE_TYPES: {
    STANDARD: 'standard',
    SIMPLIFIED: 'simplified',
    CREDIT_NOTE: 'credit_note',
    DEBIT_NOTE: 'debit_note'
  },
  
  VAT_RATES: {
    STANDARD: 0.15,
    ZERO_RATED: 0,
    EXEMPT: 0
  },
  
  ZATCA_ENDPOINTS: {
    PRODUCTION: 'https://api.zatca.gov.sa',
    SANDBOX: 'https://api-sandbox.zatca.gov.sa'
  }
};
```

## Security Implementation

### Security Middleware (`src/middleware/security.js`)
```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const xss = require('xss');

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// General rate limiting
exports.generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

// Strict rate limiting for auth endpoints
exports.authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

// Helmet security headers
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// Input sanitization
exports.sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(validator.escape(obj[key]));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// SQL injection prevention
exports.preventSQLInjection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
    /(UNION\s+SELECT)/i,
    /(SCRIPT\s*>)/i,
    /(<SCRIPT\b[^<]*(?:(?!<\/SCRIPT>)<[^<]*)*<\/SCRIPT>)/i
  ];

  const checkForSQLInjection = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        for (let pattern of sqlInjectionPatterns) {
          if (pattern.test(obj[key])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid input detected'
            });
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSQLInjection(obj[key])) return true;
      }
    }
    return false;
  };

  if (req.body) checkForSQLInjection(req.body);
  if (req.query) checkForSQLInjection(req.query);
  if (req.params) checkForSQLInjection(req.params);

  next();
};

// Password strength validation
exports.validatePasswordStrength = (req, res, next) => {
  if (req.body.password) {
    const password = req.body.password;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${minLength} characters long`
      });
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, numbers, and special characters'
      });
    }
  }

  next();
};
```

## Performance Optimization

### Database Optimization (`src/utils/databaseOptimization.js`)
```javascript
const mongoose = require('mongoose');

class DatabaseOptimizer {
  // Create indexes for better performance
  static async createIndexes() {
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    
    // Customer indexes
    await db.collection('customers').createIndex({ email: 1 }, { unique: true });
    await db.collection('customers').createIndex({ firstName: 1, lastName: 1 });
    await db.collection('customers').createIndex({ phone: 1 });
    await db.collection('customers').createIndex({ isActive: 1 });
    
    // Vehicle indexes
    await db.collection('vehicles').createIndex({ licensePlate: 1 }, { unique: true });
    await db.collection('vehicles').createIndex({ vin: 1 }, { unique: true, sparse: true });
    await db.collection('vehicles').createIndex({ customerId: 1 });
    await db.collection('vehicles').createIndex({ make: 1, model: 1 });
    
    // Appointment indexes
    await db.collection('appointments').createIndex({ appointmentDate: 1, startTime: 1 });
    await db.collection('appointments').createIndex({ customerId: 1 });
    await db.collection('appointments').createIndex({ mechanicId: 1 });
    await db.collection('appointments').createIndex({ status: 1 });
    await db.collection('appointments').createIndex({ createdAt: -1 });
    
    // Job Card indexes
    await db.collection('jobcards').createIndex({ appointmentId: 1 });
    await db.collection('jobcards').createIndex({ status: 1 });
    await db.collection('jobcards').createIndex({ mechanicId: 1 });
    await db.collection('jobcards').createIndex({ createdAt: -1 });
    
    // Invoice indexes
    await db.collection('invoices').createIndex({ customerId: 1 });
    await db.collection('invoices').createIndex({ status: 1 });
    await db.collection('invoices').createIndex({ createdAt: -1 });
    await db.collection('invoices').createIndex({ zatcaUUID: 1 });
    
    // Part indexes
    await db.collection('parts').createIndex({ partNumber: 1 }, { unique: true });
    await db.collection('parts').createIndex({ category: 1 });
    await db.collection('parts').createIndex({ stockQuantity: 1 });
    await db.collection('parts').createIndex({ isActive: 1 });
  }

  // Optimize queries with proper projection
  static optimizeQuery(query, projection = {}) {
    return query.select(projection).lean();
  }

  // Implement pagination
  static paginate(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  // Cache frequently accessed data
  static async cacheData(key, data, ttl = 300) {
    // Implementation depends on your caching solution
    // This is a placeholder for Redis or memory cache
    return data;
  }
}

module.exports = DatabaseOptimizer;
```

### Response Compression (`src/middleware/compression.js`)
```javascript
const compression = require('compression');

// Compression middleware
exports.responseCompression = compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Image optimization
exports.optimizeImages = (req, res, next) => {
  if (req.file && req.file.mimetype.startsWith('image/')) {
    // Add image optimization logic here
    // This could use sharp or similar library
    next();
  } else {
    next();
  }
};
```

## Error Handling & Logging

### Centralized Error Handling (`src/middleware/errorHandler.js`)
```javascript
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'teramotors-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    logger.error('ERROR', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = { AppError, logger };
```

## Required Dependencies

### Core Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "morgan": "^1.10.0",
  "dotenv": "^16.3.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^6.9.4",
  "socket.io": "^4.7.2",
  "joi": "^17.9.2",
  "express-rate-limit": "^6.10.0",
  "compression": "^1.7.4",
  "winston": "^3.10.0",
  "validator": "^13.11.0",
  "xss": "^1.0.14"
}
```

### ZATCA E-Invoicing Dependencies
```json
{
  "qrcode": "^1.5.3",
  "xml2js": "^0.6.2",
  "node-forge": "^1.3.1",
  "form-data": "^4.0.0",
  "axios": "^1.5.0"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1",
  "jest": "^29.6.2",
  "supertest": "^6.3.3",
  "@types/node": "^20.5.0",
  "typescript": "^5.1.6"
}
```

## Environment Variables
Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/teramotors

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ZATCA E-Invoicing Configuration
ZATCA_BASE_URL=https://api.zatca.gov.sa
ZATCA_SANDBOX_URL=https://api-sandbox.zatca.gov.sa
ZATCA_CLIENT_ID=your_zatca_client_id
ZATCA_CLIENT_SECRET=your_zatca_client_secret
ZATCA_PRIVATE_KEY=your_private_key_pem
ZATCA_CERTIFICATE=your_certificate_pem
ZATCA_ENVIRONMENT=sandbox

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret
```

## Key Features to Implement (MVP Focus)

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, mechanic, inspector)
- Password hashing with bcrypt
- Email verification system
- Password reset functionality
- Session management

### 2. ZATCA E-Invoicing Compliance ⭐ **CRITICAL**
- Phase 1: QR code generation for invoices
- Phase 2: XML invoice submission to ZATCA
- Digital signature implementation
- Invoice compliance validation
- ZATCA API integration
- Error handling for ZATCA failures

### 3. File Upload System
- Image upload for vehicles, job cards, inspections
- Document upload for estimates, invoices
- File validation and size limits
- Secure file storage
- Image compression and optimization

### 4. Email Notifications
- Appointment reminders
- Estimate approvals/rejections
- Invoice notifications
- Password reset emails
- Email verification

### 5. Real-time Updates (Socket.io Implementation)
- Socket.io server setup and configuration
- Real-time appointment updates
- Live job card status changes
- Inventory alerts and notifications
- Customer notifications
- Live dashboard updates

### 6. Security Implementation ⭐ **HIGH PRIORITY**
- API rate limiting per user/IP
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers with Helmet
- Password strength validation

### 7. Performance Optimization ⭐ **HIGH PRIORITY**
- Database indexing and query optimization
- Response compression
- Image optimization
- Pagination for large datasets
- Caching strategies
- Error handling and logging

### 8. Data Validation
- Request validation with Joi
- Input sanitization
- File type validation
- Data format validation

## Database Indexes
Create the following indexes for optimal performance:

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ isActive: 1 })

// Customer indexes
db.customers.createIndex({ email: 1 }, { unique: true })
db.customers.createIndex({ firstName: 1, lastName: 1 })
db.customers.createIndex({ phone: 1 })
db.customers.createIndex({ isActive: 1 })

// Vehicle indexes
db.vehicles.createIndex({ licensePlate: 1 }, { unique: true })
db.vehicles.createIndex({ vin: 1 }, { unique: true, sparse: true })
db.vehicles.createIndex({ customerId: 1 })
db.vehicles.createIndex({ make: 1, model: 1 })

// Part indexes
db.parts.createIndex({ partNumber: 1 }, { unique: true })
db.parts.createIndex({ category: 1 })
db.parts.createIndex({ stockQuantity: 1 })
db.parts.createIndex({ isActive: 1 })

// Appointment indexes
db.appointments.createIndex({ appointmentDate: 1, startTime: 1 })
db.appointments.createIndex({ customerId: 1 })
db.appointments.createIndex({ mechanicId: 1 })
db.appointments.createIndex({ status: 1 })
db.appointments.createIndex({ createdAt: -1 })

// Job Card indexes
db.jobcards.createIndex({ appointmentId: 1 })
db.jobcards.createIndex({ status: 1 })
db.jobcards.createIndex({ mechanicId: 1 })
db.jobcards.createIndex({ createdAt: -1 })

// Invoice indexes (ZATCA compliance)
db.invoices.createIndex({ customerId: 1 })
db.invoices.createIndex({ status: 1 })
db.invoices.createIndex({ createdAt: -1 })
db.invoices.createIndex({ zatcaUUID: 1 })
db.invoices.createIndex({ zatcaStatus: 1 })

// Estimate indexes
db.estimates.createIndex({ customerId: 1 })
db.estimates.createIndex({ status: 1 })
db.estimates.createIndex({ createdAt: -1 })

// Inspection indexes
db.vehicleinspections.createIndex({ vehicleId: 1 })
db.vehicleinspections.createIndex({ customerId: 1 })
db.vehicleinspections.createIndex({ status: 1 })
db.vehicleinspections.createIndex({ inspectionDate: -1 })
```

## Testing Strategy (MVP Focus)
- Unit tests for core controllers and services
- Integration tests for critical API endpoints
- Database connection tests
- Authentication flow tests
- ZATCA compliance tests
- File upload tests
- Email service tests
- Security middleware tests

## Deployment Considerations (MVP)
- Environment-specific configurations
- Database connection optimization
- Basic logging and monitoring
- Health check endpoints
- Graceful shutdown handling
- ZATCA sandbox vs production configuration

## Development Guidelines (MVP Focus)
1. Follow RESTful API conventions
2. Use consistent error response format
3. Implement comprehensive logging
4. Write tests for critical functionality
5. Document all endpoints
6. Follow security best practices
7. Implement proper validation
8. Use environment variables for configuration
9. Focus on ZATCA compliance
10. Optimize for performance

## Implementation Priority (MVP Roadmap)

### Phase 1: Foundation (Week 1-2)
1. **Basic Server Setup**
   - Express.js server configuration
   - MongoDB connection
   - Basic middleware setup
   - Environment configuration

2. **Authentication System**
   - JWT implementation
   - User registration/login
   - Password hashing
   - Role-based access control

### Phase 2: Core Business Logic (Week 3-4)
1. **Database Models**
   - All Mongoose schemas
   - Database indexes
   - Model relationships

2. **API Endpoints**
   - CRUD operations for all entities
   - Search and filtering
   - Pagination

### Phase 3: ZATCA Compliance (Week 5-6) ⭐ **CRITICAL**
1. **Phase 1 Implementation**
   - QR code generation
   - Invoice hash calculation
   - Basic compliance validation

2. **Phase 2 Implementation**
   - XML generation
   - Digital signatures
   - ZATCA API submission
   - Error handling

### Phase 4: Security & Performance (Week 7-8)
1. **Security Hardening**
   - Rate limiting
   - Input validation
   - Security headers
   - SQL injection prevention

2. **Performance Optimization**
   - Database optimization
   - Response compression
   - Caching implementation
   - Error handling

### Phase 5: Real-time Features (Week 9-10)
1. **Socket.io Implementation**
   - Real-time updates
   - Live notifications
   - Dashboard updates

2. **Testing & Deployment**
   - Comprehensive testing
   - Production deployment
   - Monitoring setup

This documentation provides a complete roadmap for building the MVP backend server. Each section should be implemented thoroughly to ensure a robust, secure, and ZATCA-compliant API for the TeraMotors Auto Repair Shop management system.
