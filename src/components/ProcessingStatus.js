import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Alert, Table, Badge } from 'react-bootstrap';

const ProcessingStatus = ({ processingData }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    let timer;
    if (processingData && processingData.status === 'processing') {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [processingData]);
  
  if (!processingData) {
    return null;
  }
  
  const { status, totalStudents, processedStudents, results } = processingData;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getProgressPercentage = () => {
    if (!totalStudents || totalStudents <= 0) return 0;
    return Math.round((processedStudents / totalStudents) * 100);
  };
  
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Success':
        return 'success';
      case 'Partial Success':
        return 'warning';
      case 'Failure':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  return (
    <Card className="mt-4">
      <Card.Header>Processing Status</Card.Header>
      <Card.Body>
        {status === 'processing' && (
          <>
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Processing {processedStudents} of {totalStudents} students...
            </Alert>
            
            <div className="d-flex justify-content-between mb-2">
              <span>Progress: {getProgressPercentage()}%</span>
              <span>Time elapsed: {formatTime(elapsedTime)}</span>
            </div>
            
            <ProgressBar 
              animated 
              now={getProgressPercentage()} 
              label={`${getProgressPercentage()}%`}
              className="mb-4"
            />
          </>
        )}
        
        {status === 'completed' && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            Processing completed for all {totalStudents} students in {formatTime(elapsedTime)}
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error occurred during processing: {processingData.error}
          </Alert>
        )}
        
        {results && results.length > 0 && (
          <div className="mt-3">
            <h5>Processing Results</h5>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Status</th>
                    <th>Email Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.name}</td>
                      <td>{result.rollNumber}</td>
                      <td>
                        <Badge bg={getStatusVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </td>
                      <td>
                        {result.emailSent ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="warning">No</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProcessingStatus;