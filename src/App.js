import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row, Col, Card, Nav, Spinner } from 'react-bootstrap';
import CsvUploader from './components/CsvUploader';
import JobRoleSelector from './components/JobRoleSelector';
import ResultsDisplay from './components/ResultsDisplay';
import InterviewPrep from './components/InterviewPrep';
import GdPrep from './components/GdPrep';
import { analyzeProfile } from './services/api';

function App() {
  const [csvData, setCsvData] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('main');
  
  // Listen for custom tab switch events
  React.useEffect(() => {
    const handleTabSwitch = (event) => {
      if (event.detail && analysisResults) {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('switchTab', handleTabSwitch);
    
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch);
    };
  }, [analysisResults]);
  
  const handleCsvUpload = (data) => {
    setCsvData(data);
  };
  
  const handleRoleSelection = (roles) => {
    setSelectedRoles(roles);
  };
  
  const handleAnalysis = async () => {
    if (!csvData || selectedRoles.length === 0) {
      alert('Please upload a CSV file and select at least one job role');
      return;
    }
    
    try {
      // In a real application, this would be an API call to your backend
      // For now, we'll simulate a response with loading state
      
      // Extract student name from CSV
      const studentName = csvData.data[0]?.Name || 'Student';
      
      // Generate random fit scores for selected roles
      const fitScores = selectedRoles.map(role => ({
        role: role.label,
        score: Math.floor(Math.random() * 100),
      }));
      
      // Sort fit scores to find recommended roles
      const sortedScores = [...fitScores].sort((a, b) => b.score - a.score);
      const recommendedRoles = sortedScores
        .filter(score => score.score > 70)
        .map(score => score.role);
      
      // If no roles have scores > 70, recommend the top 2
      if (recommendedRoles.length === 0) {
        recommendedRoles.push(sortedScores[0]?.role);
        if (sortedScores.length > 1) {
          recommendedRoles.push(sortedScores[1]?.role);
        }
      }
      
      // Extract skills from CSV
      const skills = [];
      for (let i = 1; i <= 5; i++) {
        const skillKey = `Skill${i}`;
        const skillLevelKey = `Skill${i}_Level`;
        if (csvData.data[0]?.[skillKey]) {
          skills.push({
            name: csvData.data[0][skillKey],
            level: csvData.data[0][skillLevelKey] || 'Beginner'
          });
        }
      }
      
      // Determine matched and missing skills based on selected roles
      const matchedSkills = skills
        .filter(skill => skill.level === 'Advanced' || skill.level === 'Intermediate')
        .map(skill => skill.name);
      
      // Sample missing skills based on selected roles
      const missingSkillsMap = {
        'Software Engineer': ['Docker', 'Kubernetes', 'CI/CD'],
        'Data Analyst': ['Tableau', 'Power BI', 'R'],
        'Data Scientist': ['TensorFlow', 'PyTorch', 'NLP'],
        'Business Analyst': ['JIRA', 'Agile Methodologies', 'Requirement Gathering'],
        'Product Manager': ['User Research', 'A/B Testing', 'Product Roadmapping'],
      };
      
      let missingSkills = [];
      selectedRoles.forEach(role => {
        const roleSpecificSkills = missingSkillsMap[role.label];
        if (roleSpecificSkills) {
          missingSkills = [...missingSkills, ...roleSpecificSkills];
        }
      });
      
      // Remove duplicates from missing skills
      missingSkills = [...new Set(missingSkills)];
      
      // Filter out skills that are already matched
      missingSkills = missingSkills.filter(skill => !matchedSkills.includes(skill));
      
      const mockResponse = {
        studentName,
        fitScores,
        recommendedRoles,
        matchedSkills,
        missingSkills,
      };
      
      setAnalysisResults(mockResponse);
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('Failed to run analysis. Please try again.');
    }
  };
  
  return (
    <div className="App">
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">🎓 Student MIS Verification + Career Role Fit System</h1>
          </Col>
        </Row>
        
        <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav.Item>
            <Nav.Link eventKey="main">Profile Analysis</Nav.Link>
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
                  <Card.Header>CSV Upload</Card.Header>
                  <Card.Body>
                    <CsvUploader onUpload={handleCsvUpload} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>Job Role Selection</Card.Header>
                  <Card.Body>
                    <JobRoleSelector onSelect={handleRoleSelection} />
                    <div className="d-grid gap-2 mt-4">
                      <button 
                        className="btn btn-primary btn-lg" 
                        onClick={handleAnalysis}
                        disabled={!csvData || selectedRoles.length === 0}
                      >
                        Run Analysis
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {analysisResults && (
              <Row>
                <Col>
                  <ResultsDisplay results={analysisResults} />
                </Col>
              </Row>
            )}
          </>
        )}
        
        {activeTab === 'interview' && <InterviewPrep results={analysisResults} />}
        {activeTab === 'gd' && <GdPrep results={analysisResults} selectedRoles={selectedRoles} />}
      </Container>
    </div>
  );
}

export default App;
