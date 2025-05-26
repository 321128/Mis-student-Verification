import React, { useState, useRef } from 'react';
import { Form, Alert } from 'react-bootstrap';

const JobDescriptionUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      return 'Please upload a PDF, DOCX, or TXT file';
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10MB limit';
    }
    
    return '';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setError('');
      onUpload(null);
      return;
    }
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      onUpload(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
    setError('');
    onUpload(selectedFile);
  };

  return (
    <div>
      <Form.Group controlId="jobDescriptionUpload" className="mb-3">
        <Form.Label>Upload Job Description File</Form.Label>
        <Form.Control 
          type="file" 
          onChange={handleFileChange}
          ref={fileInputRef}
          accept=".pdf,.docx,.txt"
        />
        <Form.Text className="text-muted">
          File should be in PDF, DOCX, or TXT format and less than 10MB in size.
        </Form.Text>
      </Form.Group>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {file && (
        <Alert variant="success">
          <i className="bi bi-check-circle-fill me-2"></i>
          File "{file.name}" ({(file.size / 1024).toFixed(2)} KB) uploaded successfully!
        </Alert>
      )}
    </div>
  );
};

export default JobDescriptionUploader;