import React, { useState, useRef } from 'react';
import { Form, Alert, Table } from 'react-bootstrap';
import Papa from 'papaparse';

const CsvUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return 'Please upload a CSV file';
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size exceeds 5MB limit';
    }
    
    return '';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setError('');
      setPreview(null);
      onUpload(null);
      return;
    }
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      setPreview(null);
      onUpload(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
    setError('');
    
    // Parse CSV for preview and pass to parent component
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Create a preview with just the first 5 rows
        const previewResults = {
          ...results,
          data: results.data.slice(0, 5)
        };
        
        setPreview(previewResults);
        
        if (results.data && results.data.length > 0) {
          console.log(`CSV parsed successfully with ${results.data.length} rows`);
          
          // Log the first row to help with debugging
          console.log('First row sample:', results.data[0]);
          
          onUpload({
            file: selectedFile,
            data: results.data
          });
        } else {
          setError('No data found in CSV file');
          onUpload(null);
        }
      },
      error: (error) => {
        setError('Error parsing CSV: ' + error.message);
        setPreview(null);
        onUpload(null);
      }
    });
  };

  const renderPreview = () => {
    if (!preview || !preview.data || preview.data.length === 0) {
      return null;
    }
    
    const headers = Object.keys(preview.data[0]);
    
    return (
      <div className="mt-4">
        <h5>CSV Preview (First 5 rows)</h5>
        <div className="table-responsive">
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Form.Group controlId="csvUpload" className="mb-3">
        <Form.Label>Upload your student profiles CSV file</Form.Label>
        <Form.Control 
          type="file" 
          onChange={handleFileChange}
          ref={fileInputRef}
          accept=".csv"
        />
        <Form.Text className="text-muted">
          File should be in CSV format and less than 5MB in size.
          Must include student name, email, and roll number/ID.
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex align-items-center mb-3">
        <i className="bi bi-info-circle text-primary me-2"></i>
        <span>Don't have a CSV file? </span>
        <a 
          href="/sample_student_data.csv" 
          download 
          className="ms-1 text-decoration-none"
        >
          Download sample template
        </a>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {file && (
        <Alert variant="success">
          <i className="bi bi-check-circle-fill me-2"></i>
          File "{file.name}" ({(file.size / 1024).toFixed(2)} KB) uploaded successfully!
        </Alert>
      )}
      
      {renderPreview()}
    </div>
  );
};

export default CsvUploader;