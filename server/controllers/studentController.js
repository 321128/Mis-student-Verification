const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { 
  parseCSV, 
  parsePDF, 
  parseDOCX, 
  parseTXT, 
  createStudentDirectory,
  logStatus
} = require('../utils/fileUtils');
const { generatePersonalizedDocument, generateEmbeddings } = require('../services/llmService');
const { generatePDF } = require('../utils/pdfUtils');
const { sendEmail } = require('../utils/emailUtils');

// Import MongoDB models
const Job = require('../models/Job');
const Student = require('../models/Student');
const Report = require('../models/Report');

/**
 * Processes student data and job description to generate personalized documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processStudentData = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.csv || !req.files.jobDesc) {
      return res.status(400).json({ error: 'Both CSV and job description files are required' });
    }

    const csvFile = req.files.csv[0];
    const jobDescFile = req.files.jobDesc[0];

    // Parse the CSV file
    const students = await parseCSV(csvFile.path);
    if (!students || students.length === 0) {
      return res.status(400).json({ error: 'No student data found in CSV file' });
    }

    // Parse the job description file based on its type
    let jobDescription = '';
    const fileExt = path.extname(jobDescFile.originalname).toLowerCase();
    
    if (fileExt === '.pdf') {
      jobDescription = await parsePDF(jobDescFile.path);
    } else if (fileExt === '.docx') {
      jobDescription = await parseDOCX(jobDescFile.path);
    } else if (fileExt === '.txt') {
      jobDescription = await parseTXT(jobDescFile.path);
    } else {
      return res.status(400).json({ error: 'Unsupported job description file format' });
    }

    // Create a job ID
    const jobId = uuidv4();
    
    // Extract job title from the first 100 characters of job description
    const jobTitle = jobDescription.substring(0, 100).split('\n')[0].trim();
    
    // Create initial job in MongoDB
    const newJob = new Job({
      jobId,
      status: 'processing',
      totalStudents: students.length,
      processedStudents: 0,
      jobDescriptionLength: jobDescription.length,
      jobDescriptionTitle: jobTitle,
      results: []
    });
    
    // Save job to MongoDB
    await newJob.save();
    
    // Send initial response
    res.status(202).json({ 
      job_id: jobId,
      status: 'processing', 
      message: 'Processing started',
      total_students: students.length
    });

    // Process each student asynchronously
    const results = [];
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      try {
        // Validate student data
        if (!student.Name || !student.Email) {
          logStatus('Unknown', 'Failure', 'Missing required student data (Name or Email)');
          const result = {
            name: student.Name || 'Unknown',
            email: student.Email || 'unknown@example.com',
            rollNumber: 'unknown',
            status: 'Failure',
            error: 'Missing required student data',
            processedAt: new Date()
          };
          results.push(result);
          
          // Update job in MongoDB
          await Job.findOneAndUpdate(
            { jobId },
            { 
              $inc: { processedStudents: 1 },
              $push: { results: result }
            }
          );
          
          continue;
        }

        // Use roll number or create an ID if not available
        const rollNumber = student.Roll_Number || 
                          student.ID || 
                          student.StudentID || 
                          `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create directory for student
        const studentDir = createStudentDirectory(rollNumber);

        // Check if student exists in database, create if not
        let studentDoc = await Student.findOne({ email: student.Email });
        
        if (!studentDoc) {
          // Extract skills from student data
          const skills = [];
          for (let j = 1; j <= 5; j++) {
            const skillKey = `Skill${j}`;
            const skillLevelKey = `Skill${j}_Level`;
            if (student[skillKey]) {
              skills.push({
                name: student[skillKey],
                level: student[skillLevelKey] || 'Beginner'
              });
            }
          }
          
          // Create new student
          studentDoc = new Student({
            name: student.Name,
            email: student.Email,
            rollNumber,
            university: student.University || student.College,
            degree: student.Degree,
            major: student.Major || student.Specialization,
            graduationYear: student.Graduation_Year,
            skills
          });
          
          await studentDoc.save();
        }

        // Generate personalized document using LLM
        const llmResponse = await generatePersonalizedDocument(student, jobDescription);

        // Generate PDF
        const pdfPath = await generatePDF(student, llmResponse, studentDir);
        
        // Create report
        const report = new Report({
          student: studentDoc._id,
          jobTitle: jobTitle,
          jobDescription,
          pdfPath: path.relative(path.join(__dirname, '..'), pdfPath),
          llmResponse,
          jobId
        });
        
        await report.save();
        
        // Update student with report reference
        await Student.findByIdAndUpdate(
          studentDoc._id,
          { $push: { reports: report._id } }
        );

        // Send email with PDF
        const emailSent = await sendEmail(student.Email, student.Name, rollNumber, pdfPath);

        // Log status
        const status = emailSent ? 'Success' : 'Partial Success';
        logStatus(rollNumber, status, emailSent ? 'Completed successfully' : 'PDF generated but email not sent');

        const result = {
          name: student.Name,
          email: student.Email,
          rollNumber,
          status,
          pdfPath: path.relative(path.join(__dirname, '..'), pdfPath),
          emailSent,
          processedAt: new Date()
        };
        results.push(result);
        
        // Update job in MongoDB
        await Job.findOneAndUpdate(
          { jobId },
          { 
            $inc: { processedStudents: 1 },
            $push: { results: result }
          }
        );
      } catch (error) {
        console.error(`Error processing student ${student.Name || 'Unknown'}:`, error);
        
        const rollNumber = student.Roll_Number || 
                          student.ID || 
                          student.StudentID || 
                          'unknown';
                          
        logStatus(rollNumber, 'Failure', error.message);
        
        const result = {
          name: student.Name || 'Unknown',
          email: student.Email || 'unknown@example.com',
          rollNumber,
          status: 'Failure',
          error: error.message,
          processedAt: new Date()
        };
        results.push(result);
        
        // Update job in MongoDB
        await Job.findOneAndUpdate(
          { jobId },
          { 
            $inc: { processedStudents: 1 },
            $push: { results: result }
          }
        );
      }
    }

    // Clean up uploaded files
    try {
      fs.unlinkSync(csvFile.path);
      fs.unlinkSync(jobDescFile.path);
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }

    // Update job status to completed in MongoDB
    await Job.findOneAndUpdate(
      { jobId },
      { 
        status: 'completed',
        completedAt: new Date()
      }
    );

    console.log(`Processing completed for all students. Job ID: ${jobId}`);
  } catch (error) {
    console.error('Error in processStudentData:', error);
    // If response hasn't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = {
  processStudentData
};