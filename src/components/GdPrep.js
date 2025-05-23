import React, { useState } from 'react';
import { Card, Button, ListGroup, Accordion, Badge, Spinner } from 'react-bootstrap';

const GdPrep = ({ results, selectedRoles }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [topics, setTopics] = useState(null);
  
  // Initial GD topics based on job roles
  const initialTopics = {
    software_engineer: [
      {
        title: "Is AI Going to Replace Software Engineers?",
        description: "Discussing the impact of AI tools like GitHub Copilot and ChatGPT on the future of software development jobs.",
        keyPoints: [
          "Current limitations of AI in complex problem-solving",
          "Areas where AI is already changing development workflows",
          "Skills engineers need to stay relevant in an AI-augmented future"
        ]
      },
      {
        title: "Remote Work vs. Office-Based Development Teams",
        description: "Debating the pros and cons of remote work for software development teams post-pandemic.",
        keyPoints: [
          "Impact on collaboration and code quality",
          "Tools and practices for effective remote development",
          "Hybrid approaches and their implementation challenges"
        ]
      }
    ],
    data_analyst: [
      {
        title: "Data Privacy vs. Data Utility",
        description: "Exploring the balance between leveraging data for insights and protecting user privacy.",
        keyPoints: [
          "Anonymization techniques and their effectiveness",
          "Regulatory frameworks across different regions",
          "Ethical considerations in data collection and analysis"
        ]
      },
      {
        title: "Democratization of Data Analysis",
        description: "Discussing whether data analysis should be accessible to everyone or remain a specialized skill.",
        keyPoints: [
          "No-code/low-code analytics platforms and their limitations",
          "Data literacy as an organizational competency",
          "Potential risks of misinterpretation by non-specialists"
        ]
      }
    ],
    business_analyst: [
      {
        title: "Agile vs. Traditional Project Management",
        description: "Debating which methodology is more effective for different types of business projects.",
        keyPoints: [
          "Adaptability vs. predictability in project planning",
          "Stakeholder engagement across different methodologies",
          "Hybrid approaches for complex organizational environments"
        ]
      },
      {
        title: "Business Analysis in the Age of AI",
        description: "Exploring how AI is changing the role of business analysts and the skills needed to stay relevant.",
        keyPoints: [
          "AI tools for requirements gathering and analysis",
          "Shifting focus from data collection to insight generation",
          "Ethical considerations in AI-driven decision making"
        ]
      }
    ]
  };
  
  // Get relevant GD topics based on selected roles
  const getRelevantTopics = () => {
    if (!selectedRoles || selectedRoles.length === 0) {
      return [
        {
          title: "The Future of Work in a Digital Economy",
          description: "Discussing how technology is reshaping careers and workplaces across industries.",
          keyPoints: [
            "Impact of automation on traditional job roles",
            "Skills that will remain valuable in the future",
            "Preparing for careers that don't exist yet"
          ]
        },
        {
          title: "Ethical Considerations in Technology",
          description: "Debating the ethical responsibilities of technology professionals and companies.",
          keyPoints: [
            "Privacy concerns in the digital age",
            "Algorithmic bias and fairness",
            "Corporate responsibility vs. government regulation"
          ]
        }
      ];
    }
    
    let relevantTopics = [];
    selectedRoles.forEach(role => {
      const roleKey = role.value;
      if (initialTopics[roleKey]) {
        relevantTopics = [...relevantTopics, ...initialTopics[roleKey]];
      }
    });
    
    // If no specific topics found, return general topics
    if (relevantTopics.length === 0) {
      return getRelevantTopics();
    }
    
    return relevantTopics;
  };
  
  const generateMoreTopics = () => {
    setIsGenerating(true);
    
    // In a real application, this would call an LLM API to generate more topics
    // For now, we'll simulate a response after a delay
    setTimeout(() => {
      const newTopics = [
        {
          title: "Balancing Technical Debt and Feature Development",
          description: "Discussing strategies for managing technical debt while maintaining development velocity.",
          keyPoints: [
            "Identifying and quantifying technical debt",
            "Strategies for incremental refactoring",
            "Making the business case for addressing technical debt"
          ]
        },
        {
          title: "Cross-functional Teams vs. Specialized Departments",
          description: "Debating the most effective organizational structure for technology teams.",
          keyPoints: [
            "Impact on innovation and problem-solving",
            "Knowledge sharing and skill development",
            "Challenges in management and performance evaluation"
          ]
        },
        {
          title: "The Role of Soft Skills in Technical Careers",
          description: "Exploring the importance of communication, leadership, and emotional intelligence in technical roles.",
          keyPoints: [
            "Balancing technical expertise with interpersonal skills",
            "Effective communication with non-technical stakeholders",
            "Leadership development for technical professionals"
          ]
        }
      ];
      
      setTopics(prevTopics => [...(prevTopics || getRelevantTopics()), ...newTopics]);
      setIsGenerating(false);
    }, 2000);
  };
  
  // Initialize topics if not already set
  if (topics === null) {
    setTopics(getRelevantTopics());
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header as="h4" className="bg-primary text-white">
        Group Discussion Preparation
      </Card.Header>
      <Card.Body>
        <p className="lead">
          Prepare for group discussions with these current topics relevant to your target roles.
        </p>
        
        <Accordion defaultActiveKey="0" className="mb-4">
          {topics && topics.map((topic, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <span>{topic.title}</span>
                  <Badge bg="info" className="ms-2">Current Topic</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <p>{topic.description}</p>
                <h6>Key Points to Consider:</h6>
                <ListGroup variant="flush">
                  {topic.keyPoints.map((point, pointIndex) => (
                    <ListGroup.Item key={pointIndex}>
                      {point}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="mt-3">
                  <h6>Preparation Tips:</h6>
                  <ul>
                    <li>Research current statistics and case studies related to this topic</li>
                    <li>Prepare arguments for both sides of the debate</li>
                    <li>Consider industry-specific implications</li>
                    <li>Practice articulating your viewpoint concisely</li>
                  </ul>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        
        <div className="text-center">
          <Button 
            variant="success" 
            size="lg" 
            onClick={generateMoreTopics}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Generating...
              </>
            ) : (
              <>Generate More Topics</>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default GdPrep;