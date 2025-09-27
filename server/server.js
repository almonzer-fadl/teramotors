const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin', {
  dbName: "teramotors",
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 5,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room for dashboard updates
  socket.on('join-dashboard', () => {
    socket.join('dashboard');
    console.log('Client joined dashboard room');
  });

  // Join room for job card updates
  socket.on('join-job-card', (jobCardId) => {
    socket.join(`job-card-${jobCardId}`);
    console.log(`Client joined job card room: ${jobCardId}`);
  });

  // Handle job card status updates
  socket.on('job-card-status-update', (data) => {
    io.to(`job-card-${data.jobCardId}`).emit('job-card-status-changed', data);
    io.to('dashboard').emit('dashboard-update', { type: 'job-card-update', data });
  });

  // Handle new job card creation
  socket.on('job-card-created', (data) => {
    io.to('dashboard').emit('dashboard-update', { type: 'job-card-created', data });
  });

  // Handle invoice creation
  socket.on('invoice-created', (data) => {
    io.to('dashboard').emit('dashboard-update', { type: 'invoice-created', data });
  });

  // Handle customer updates
  socket.on('customer-updated', (data) => {
    io.to('dashboard').emit('dashboard-update', { type: 'customer-updated', data });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
});
