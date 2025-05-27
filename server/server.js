require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const { processStudentData } = require('./controllers/studentController');
const { setupFolders, validateFileMimeType } = require('./utils/fileUtils');

// Import models
const Job = require('./models/Job');
const Student = require('./models/Student');
const Report = require('./models/Report');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log(`Processing file upload with fieldname: ${file.fieldname}, mimetype: ${file.mimetype}, originalname: ${file.originalname}`);
    
    // Use the utility function for validation
    const validation = validateFileMimeType(file.fieldname, file.mimetype);
    
    if (validation.isValid) {
      cb(null, true);
    } else {
      console.error(`File validation failed: ${validation.message}`);
      cb(new Error(validation.message));
    }
  }
});

// Create required directories
setupFolders();

// Routes
app.post('/api/upload', (req, res, next) => {
  console.log('Received upload request');
  
  // Apply multer middleware with error handling
  upload.fields([
    { name: 'csv', maxCount: 1 },
    { name: 'jobDesc', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        error: err.message,
        details: 'File upload failed. Please ensure you are uploading the correct file types (CSV for student data, PDF/DOCX/TXT for job descriptions) and using the correct field names (csv, jobDesc).'
      });
    }
    
    // Check if required files are present
    if (!req.files || !req.files.csv || !req.files.jobDesc) {
      return res.status(400).json({ 
        error: 'Missing required files',
        details: 'Both CSV file (student data) and job description file (PDF/DOCX/TXT) are required.'
      });
    }
    
    // Log successful file uploads
    console.log('Files uploaded successfully:', {
      csv: req.files.csv[0].originalname,
      jobDesc: req.files.jobDesc[0].originalname
    });
    
    // Continue to the processStudentData controller
    processStudentData(req, res, next);
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  // If MongoDB is not connected, return a 503 status
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      ...health,
      status: 'Service Unavailable',
      message: 'MongoDB connection is not established'
    });
  }
  
  res.json({
    ...health,
    status: 'OK',
    message: 'Service is healthy'
  });
});

// Job status endpoint
app.get('/api/job/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  
  try {
    const job = await Job.findOne({ jobId });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error(`Error retrieving job ${jobId}:`, error);
    res.status(500).json({ error: 'Error retrieving job status' });
  }
});

// Get all jobs endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).limit(10);
    res.json(jobs);
  } catch (error) {
    console.error('Error retrieving jobs:', error);
    res.status(500).json({ error: 'Error retrieving jobs' });
  }
});

// Get student reports endpoint
app.get('/api/student/:email/reports', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email }).populate('reports');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student.reports);
  } catch (error) {
    console.error(`Error retrieving reports for student ${req.params.email}:`, error);
    res.status(500).json({ error: 'Error retrieving student reports' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle Multer errors specifically
  if (err.name === 'MulterError') {
    let errorMessage = 'File upload error';
    let statusCode = 400;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        errorMessage = 'File is too large. Maximum size is 10MB.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        errorMessage = `Unexpected field: ${err.field}. Expected 'csv' or 'jobDesc'.`;
        break;
      case 'LIMIT_FILE_COUNT':
        errorMessage = 'Too many files uploaded.';
        break;
      default:
        errorMessage = err.message;
    }
    
    return res.status(statusCode).json({
      error: errorMessage,
      code: err.code,
      field: err.field
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  // Handle file system errors
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'File not found',
      details: err.message
    });
  }
  
  // Default error handler
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    // Don't exit immediately, allow for retry logic in connectDB
  });