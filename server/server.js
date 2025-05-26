require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const { processStudentData } = require('./controllers/studentController');
const { setupFolders } = require('./utils/fileUtils');

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
    if (file.fieldname === 'csv') {
      if (file.mimetype === 'text/csv') {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed for student data'));
      }
    } else if (file.fieldname === 'jobDescription') {
      const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOCX, or TXT files are allowed for job descriptions'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// Create required directories
setupFolders();

// Routes
app.post('/api/upload', upload.fields([
  { name: 'csv', maxCount: 1 },
  { name: 'jobDesc', maxCount: 1 }
]), processStudentData);

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
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
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong on the server'
  });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});