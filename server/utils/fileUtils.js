const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Creates necessary folders for the application
 */
const setupFolders = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../outputs'),
    path.join(__dirname, '../outputs/jobs'),
    path.join(__dirname, '../logs')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

/**
 * Parses a CSV file and returns the data as JSON
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Promise resolving to array of objects
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Parses a PDF file and returns the text content
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Promise resolving to text content
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error parsing PDF: ${error.message}`);
  }
};

/**
 * Parses a DOCX file and returns the text content
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Promise resolving to text content
 */
const parseDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Error parsing DOCX: ${error.message}`);
  }
};

/**
 * Parses a TXT file and returns the text content
 * @param {string} filePath - Path to the TXT file
 * @returns {Promise<string>} - Promise resolving to text content
 */
const parseTXT = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(`Error parsing TXT: ${err.message}`));
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Creates a directory for a student based on their roll number
 * @param {string} rollNumber - Student's roll number
 * @returns {string} - Path to the created directory
 */
const createStudentDirectory = (rollNumber) => {
  const dirPath = path.join(__dirname, '../outputs', rollNumber);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

/**
 * Logs processing status to a file
 * @param {string} rollNumber - Student's roll number
 * @param {string} status - Processing status (Success/Failure)
 * @param {string} message - Additional message
 */
const logStatus = (rollNumber, status, message = '') => {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'processing.log');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${rollNumber} | ${status} | ${message}\n`;
  
  fs.appendFileSync(logFile, logEntry);
};

/**
 * Validates file MIME types
 * @param {string} fieldname - Field name of the file
 * @param {string} mimetype - MIME type of the file
 * @returns {Object} - Validation result with isValid and message properties
 */
const validateFileMimeType = (fieldname, mimetype) => {
  if (fieldname === 'csv') {
    if (mimetype === 'text/csv') {
      return { isValid: true, message: 'Valid CSV file' };
    } else {
      return { 
        isValid: false, 
        message: 'Invalid file type for CSV. Only text/csv is allowed.' 
      };
    }
  } else if (fieldname === 'jobDesc') {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedMimeTypes.includes(mimetype)) {
      return { isValid: true, message: 'Valid job description file' };
    } else {
      return { 
        isValid: false, 
        message: 'Invalid file type for job description. Only PDF, DOCX, DOC, or TXT files are allowed.' 
      };
    }
  } else {
    return { 
      isValid: false, 
      message: `Unexpected field: ${fieldname}. Expected 'csv' or 'jobDesc'.` 
    };
  }
};

/**
 * Gets the appropriate parser function based on file extension
 * @param {string} filename - Original filename
 * @returns {Function|null} - Parser function or null if not supported
 */
const getParserForFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return parsePDF;
    case '.docx':
      return parseDOCX;
    case '.doc':
      return parseDOCX; // Use the same parser for .doc files
    case '.txt':
      return parseTXT;
    case '.csv':
      return parseCSV;
    default:
      return null;
  }
};

module.exports = {
  setupFolders,
  parseCSV,
  parsePDF,
  parseDOCX,
  parseTXT,
  createStudentDirectory,
  logStatus,
  validateFileMimeType,
  getParserForFile
};