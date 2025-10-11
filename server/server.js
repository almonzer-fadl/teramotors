require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { getPDFGenerator } = require('./lib/pdf-generator');

// Import all models to register them with mongoose
const Invoice = require('./models/Invoice');
const JobCard = require('./models/JobCard');
const Customer = require('./models/Customer');
const Vehicle = require('./models/Vehicle');
const Service = require('./models/Service');
const Part = require('./models/Part');

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

// PDF Generation Endpoint
app.get('/api/invoices/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const language = req.query.lang || 'ar';
    const format = req.query.format || 'A4';

    // Fetch invoice with populated fields
    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Fetch job card if exists
    let jobCard = null;
    if (invoice.jobCardId) {
      jobCard = await JobCard.findById(invoice.jobCardId)
        .populate('services.serviceId')
        .populate('partsUsed.partId');
    }

    // Generate PDF
    const pdfGenerator = getPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice, jobCard, {
      language,
      format,
      includeQRCode: true
    });

    const filename = `invoice-${id}-${language}-${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message
    });
  }
});

// HTML Invoice View Endpoint
app.get('/api/invoices/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const language = req.query.lang || 'ar';

    // Fetch invoice with populated fields
    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId');

    if (!invoice) {
      return res.status(404).send('<h1>Invoice not found</h1>');
    }

    // Fetch job card if exists
    let jobCard = null;
    if (invoice.jobCardId) {
      jobCard = await JobCard.findById(invoice.jobCardId)
        .populate('services.serviceId')
        .populate('partsUsed.partId');
    }

    // Generate HTML using the PDF generator's HTML method
    const pdfGenerator = getPDFGenerator();
    const html = pdfGenerator.generateInvoiceHTML(invoice, jobCard, { language });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error generating HTML invoice:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error generating invoice</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin')
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
