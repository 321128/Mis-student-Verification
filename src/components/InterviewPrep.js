import React, { useState, useRef } from 'react';
import { Card, Button, Form, Alert, ListGroup, Badge } from 'react-bootstrap';

const InterviewPrep = ({ results }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Sample interview questions based on job roles
  const interviewQuestions = {
    software_engineer: [
      "Explain the difference between inheritance and composition in object-oriented programming.",
      "How would you optimize a slow-performing SQL query?",
      "Describe a challenging bug you've encountered and how you solved it.",
      "What's your approach to writing clean, maintainable code?",
      "How do you stay updated with the latest technologies and programming practices?"
    ],
    data_analyst: [
      "Explain the difference between supervised and unsupervised learning.",
      "How would you handle missing data in a dataset?",
      "Describe a data analysis project you've worked on and the insights you discovered.",
      "What tools and techniques do you use for data visualization?",
      "How do you ensure the accuracy and reliability of your data analysis?"
    ],
    business_analyst: [
      "How do you gather and document business requirements?",
      "Describe a situation where you had to bridge communication between technical and non-technical stakeholders.",
      "What methodologies do you use for process improvement?",
      "How do you prioritize competing business needs?",
      "Describe how you've used data to drive business decisions."
    ]
  };
  
  // Get relevant questions based on results
  const getRelevantQuestions = () => {
    if (!results) return [];
    
    let questions = [];
    results.fitScores.forEach(score => {
      const roleKey = score.role.toLowerCase().replace(' ', '_');
      if (interviewQuestions[roleKey]) {
        questions = [...questions, ...interviewQuestions[roleKey]];
      }
    });
    
    // If no specific questions found, return general questions
    if (questions.length === 0) {
      return [
        "Tell me about yourself and your background.",
        "What are your strengths and weaknesses?",
        "Why are you interested in this field?",
        "Describe a challenging project you've worked on.",
        "Where do you see yourself in five years?"
      ];
    }
    
    return questions;
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // In a real application, you would send the audio to a speech-to-text API
        // For now, we'll simulate a response
        simulateTranscription();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const simulateTranscription = () => {
    // In a real application, this would be the result from a speech-to-text API
    const simulatedResponses = {
      "Explain the difference between inheritance and composition in object-oriented programming.": 
        "Inheritance is when a class inherits properties and methods from a parent class, creating an 'is-a' relationship. Composition is when a class contains instances of other classes as properties, creating a 'has-a' relationship. Composition is often preferred as it provides more flexibility and avoids some of the problems of inheritance like tight coupling.",
      
      "How would you handle missing data in a dataset?":
        "For handling missing data, I would first analyze the pattern of missingness to determine if it's missing completely at random, missing at random, or missing not at random. Then depending on the situation, I might use techniques like imputation with mean, median, or mode values, or more advanced methods like KNN or regression imputation. In some cases, I might also consider dropping rows or columns if the missing data is too extensive.",
      
      "default": "I believe the key to success in this role is combining technical skills with strong communication abilities. My experience in similar projects has prepared me well for these challenges, and I'm excited about the opportunity to contribute to your team."
    };
    
    // Get the simulated response based on the selected question
    const response = simulatedResponses[selectedQuestion] || simulatedResponses.default;
    setRecordedText(response);
    
    // Generate feedback
    provideFeedback(response);
  };
  
  const provideFeedback = (text) => {
    // In a real application, this would call an LLM API for grammar and content feedback
    // For now, we'll simulate feedback
    
    const simulatedFeedback = {
      grammar: {
        score: 85,
        suggestions: [
          "Consider using more varied sentence structures",
          "Watch for overuse of filler words"
        ]
      },
      content: {
        score: 90,
        strengths: [
          "Good technical explanation",
          "Clear examples provided"
        ],
        improvements: [
          "Could include more specific examples from personal experience",
          "Consider addressing potential follow-up questions"
        ]
      },
      delivery: {
        score: 80,
        suggestions: [
          "Maintain a steady pace throughout your answer",
          "Use pauses effectively to emphasize key points"
        ]
      }
    };
    
    setFeedback(simulatedFeedback);
  };
  
  const handleQuestionSelect = (e) => {
    setSelectedQuestion(e.target.value);
    // Reset previous responses and feedback
    setRecordedText('');
    setFeedback(null);
  };
  
  const questions = getRelevantQuestions();
  
  return (
    <Card className="shadow-sm">
      <Card.Header as="h4" className="bg-primary text-white">
        Interview Preparation
      </Card.Header>
      <Card.Body>
        <p className="lead">
          Practice answering interview questions for your target roles. Speak your answer and receive feedback on your response.
        </p>
        
        <Form.Group className="mb-4">
          <Form.Label>Select an interview question:</Form.Label>
          <Form.Select 
            value={selectedQuestion} 
            onChange={handleQuestionSelect}
            className="mb-3"
          >
            <option value="">-- Select a question --</option>
            {questions.map((question, index) => (
              <option key={index} value={question}>
                {question}
              </option>
            ))}
          </Form.Select>
          
          {selectedQuestion && (
            <Alert variant="info">
              <strong>Question:</strong> {selectedQuestion}
            </Alert>
          )}
        </Form.Group>
        
        {selectedQuestion && (
          <div className="text-center mb-4">
            {!isRecording ? (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={startRecording}
                disabled={!selectedQuestion}
              >
                <i className="bi bi-mic-fill me-2"></i>
                Start Recording
              </Button>
            ) : (
              <Button 
                variant="danger" 
                size="lg" 
                onClick={stopRecording}
              >
                <i className="bi bi-stop-fill me-2"></i>
                Stop Recording
              </Button>
            )}
          </div>
        )}
        
        {recordedText && (
          <div className="mt-4">
            <h5>Your Response:</h5>
            <Card className="mb-4">
              <Card.Body>
                <p>{recordedText}</p>
              </Card.Body>
            </Card>
          </div>
        )}
        
        {feedback && (
          <div className="mt-4">
            <h5>Feedback:</h5>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Grammar & Language</strong>
                    <Badge bg={feedback.grammar.score >= 80 ? "success" : "warning"}>
                      {feedback.grammar.score}/100
                    </Badge>
                  </div>
                  <ul className="mt-2 mb-0">
                    {feedback.grammar.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Content Quality</strong>
                    <Badge bg={feedback.content.score >= 80 ? "success" : "warning"}>
                      {feedback.content.score}/100
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="mb-1"><strong>Strengths:</strong></p>
                    <ul>
                      {feedback.content.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                    <p className="mb-1"><strong>Areas for Improvement:</strong></p>
                    <ul className="mb-0">
                      {feedback.content.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Delivery</strong>
                    <Badge bg={feedback.delivery.score >= 80 ? "success" : "warning"}>
                      {feedback.delivery.score}/100
                    </Badge>
                  </div>
                  <ul className="mt-2 mb-0">
                    {feedback.delivery.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default InterviewPrep;