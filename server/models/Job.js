const mongoose = require('mongoose');

const StudentResultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Partial Success', 'Failure', 'Processing'],
    default: 'Processing'
  },
  pdfPath: {
    type: String
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  error: {
    type: String
  },
  processedAt: {
    type: Date
  }
});

const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  totalStudents: {
    type: Number,
    required: true
  },
  processedStudents: {
    type: Number,
    default: 0
  },
  jobDescriptionLength: {
    type: Number
  },
  jobDescriptionTitle: {
    type: String
  },
  results: [StudentResultSchema]
});

module.exports = mongoose.model('Job', JobSchema);