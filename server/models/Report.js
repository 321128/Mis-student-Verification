const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  resources: [{
    type: String
  }],
  pdfPath: {
    type: String,
    required: true
  },
  llmResponse: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  jobId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Report', ReportSchema);