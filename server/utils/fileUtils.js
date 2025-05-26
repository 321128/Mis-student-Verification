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

module.exports = {
  setupFolders,
  parseCSV,
  parsePDF,
  parseDOCX,
  parseTXT,
  createStudentDirectory,
  logStatus
};