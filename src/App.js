import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row, Col, Card, Nav, Alert, Spinner } from 'react-bootstrap';
import CsvUploader from './components/CsvUploader';
import JobDescriptionUploader from './components/JobDescriptionUploader';
import ProcessingStatus from './components/ProcessingStatus';
// Removed unused import: ResultsDisplay
import InterviewPrep from './components/InterviewPrep';
import GdPrep from './components/GdPrep';
import { uploadFiles, getProcessingStatus } from './services/api';

function App() {
  const [csvData, setCsvData] = useState(null);
  const [jobDescFile, setJobDescFile] = useState(null);
  // Using a default value for selectedRoles since we're not changing it
  const [selectedRoles] = useState([]);
  // Using a default value for analysisResults since we're not changing it
  const [analysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('main');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [processingData, setProcessingData] = useState(null);
  
  // Listen for custom tab switch events
  useEffect(() => {
    const handleTabSwitch = (event) => {
      if (event.detail && analysisResults) {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('switchTab', handleTabSwitch);
    
    // Log the current hostname and port for debugging
    console.log('App running at:', window.location.hostname, window.location.port);
    
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch);
    };
  }, [analysisResults]);
  
  // Poll for processing status from the backend
  useEffect(() => {
    let timer;
    
    if (processingData && processingData.status === 'processing' && processingData.jobId) {
      timer = setInterval(async () => {
        try {
          // Call the API to get the current status
          const statusResponse = await getProcessingStatus(processingData.jobId);
          console.log('Status update:', statusResponse);
          
          // Update the processing data
          setProcessingData(prev => {
            if (!prev) return null;
            
            // If processing is complete, clear the interval
            if (statusResponse.status === 'completed') {
              clearInterval(timer);
              setIsProcessing(false);
              
              return {
                ...prev,
                status: 'completed',
                processedStudents: statusResponse.processed_students || statusResponse.total_students,
                totalStudents: statusResponse.total_students,
                results: statusResponse.results || []
              };
            }
            
            // Otherwise, update the progress
            return {
              ...prev,
              processedStudents: statusResponse.processed_students || 0,
              totalStudents: statusResponse.total_students
            };
          });
        } catch (error) {
          console.error('Error polling for status:', error);
          // If there's an error, we'll keep trying
        }
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [processingData]);
  
  const handleCsvUpload = (data) => {
    setCsvData(data);
  };
  
  const handleJobDescUpload = (file) => {
    setJobDescFile(file);
  };
  
  const handleProcessFiles = async () => {
    if (!csvData || !jobDescFile) {
      alert('Please upload both a CSV file and a job description file');
      return;
    }
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Call the backend API to upload files and start processing
      const response = await uploadFiles(csvData, jobDescFile);
      
      console.log('API Response:', response);
      
      // Ensure we have valid data
      const totalStudents = csvData.data && Array.isArray(csvData.data) ? csvData.data.length : 0;
      
      if (totalStudents === 0) {
        throw new Error('No student data found in the CSV file');
      }
      
      console.log('Processing', totalStudents, 'students');
      
      // Set initial processing data
      setProcessingData({
        jobId: response.job_id,
        status: response.status,
        totalStudents: totalStudents,
        processedStudents: 0,
        jobDescriptionLength: jobDescFile.size,
        results: []
      });
      
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingError(error.message || 'Failed to process files. Please try again.');
      setProcessingData(null);
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="App">
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">🎓 Student MIS Verification + Document Generation System</h1>
          </Col>
        </Row>
        
        <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav.Item>
            <Nav.Link eventKey="main">File Processing</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="interview" disabled={!analysisResults}>Interview Preparation</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="gd" disabled={!analysisResults}>GD Preparation</Nav.Link>
          </Nav.Item>
        </Nav>
        
        {activeTab === 'main' && (
          <>
            <Row className="mb-4">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>Student Profiles CSV Upload</Card.Header>
                  <Card.Body>
                    <CsvUploader onUpload={handleCsvUpload} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>Job Description Upload</Card.Header>
                  <Card.Body>
                    <JobDescriptionUploader onUpload={handleJobDescUpload} />
                    <div className="d-grid gap-2 mt-4">
                      <button 
                        className="btn btn-primary btn-lg" 
                        onClick={handleProcessFiles}
                        disabled={!csvData || !jobDescFile || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Processing...
                          </>
                        ) : (
                          'Process Files'
                        )}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {processingError && (
              <Alert variant="danger" className="mb-4">
                <Alert.Heading>Processing Error</Alert.Heading>
                <p>{processingError}</p>
              </Alert>
            )}
            
            {processingData && <ProcessingStatus processingData={processingData} />}
          </>
        )}
        
        {activeTab === 'interview' && <InterviewPrep results={analysisResults} />}
        {activeTab === 'gd' && <GdPrep results={analysisResults} selectedRoles={selectedRoles} />}
      </Container>
    </div>
  );
}

export default App;
