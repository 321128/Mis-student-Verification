import React from 'react';
import { Card, Row, Col, Badge, ProgressBar, Button } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  const { studentName, fitScores, recommendedRoles, matchedSkills, missingSkills } = results;

  // Prepare data for pie chart
  const pieData = {
    labels: fitScores.map(score => score.role),
    datasets: [
      {
        label: 'Career Fit Score',
        data: fitScores.map(score => score.score),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Helper function to determine badge color based on score
  const getBadgeColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h4" className="bg-primary text-white">
        Analysis Results for {studentName}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <h5>Career Fit Scores</h5>
            <div className="mb-4">
              {fitScores.map((score, index) => (
                <div key={index} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{score.role}</span>
                    <Badge bg={getBadgeColor(score.score)}>{score.score}%</Badge>
                  </div>
                  <ProgressBar 
                    now={score.score} 
                    variant={getBadgeColor(score.score)} 
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </Col>
          
          <Col md={4}>
            <h5>Recommended Roles</h5>
            <div className="mb-3">
              {recommendedRoles.map((role, index) => (
                <Badge 
                  key={index} 
                  bg="success" 
                  className="me-2 mb-2 p-2"
                >
                  {role}
                </Badge>
              ))}
            </div>
            
            <h5 className="mt-4">Skills Analysis</h5>
            <div>
              <h6>Matched Skills</h6>
              <div className="mb-2">
                {matchedSkills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    bg="info" 
                    className="me-2 mb-2"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <h6 className="mt-3">Skills to Develop</h6>
              <div>
                {missingSkills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    bg="warning" 
                    text="dark" 
                    className="me-2 mb-2"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Col>
          
          <Col md={4}>
            <h5>Career Fit Visualization</h5>
            <div className="chart-container" style={{ height: '250px' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
            
            <div className="d-flex justify-content-center mt-4 gap-3">
              <Button 
                variant="outline-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'interview' }))}
              >
                <i className="bi bi-mic-fill me-2"></i>
                Interview Preparation
              </Button>
              <Button 
                variant="outline-success"
                onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'gd' }))}
              >
                <i className="bi bi-people-fill me-2"></i>
                GD Preparation
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ResultsDisplay;