// This is a mock API service that simulates backend functionality
// In a real application, this would make actual API calls to your backend

/**
 * Analyzes student profile and job role compatibility
 * @param {Object} csvData - The parsed CSV data containing student information
 * @param {Array} selectedRoles - Array of selected job roles
 * @returns {Promise} - Promise that resolves to analysis results
 */
export const analyzeProfile = async (csvData, selectedRoles) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // Extract student name from CSV
    const studentName = csvData.data[0]?.Name || 'Student';
    
    // Generate fit scores for selected roles
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
      'UX Designer': ['Figma', 'User Testing', 'Wireframing'],
      'Frontend Developer': ['React', 'Vue.js', 'TypeScript'],
      'Backend Developer': ['Node.js', 'Django', 'Ruby on Rails'],
      'Full Stack Developer': ['GraphQL', 'MongoDB', 'AWS'],
      'DevOps Engineer': ['Terraform', 'Jenkins', 'AWS'],
      'Cloud Architect': ['Azure', 'GCP', 'Serverless'],
      'Machine Learning Engineer': ['Scikit-learn', 'Deep Learning', 'Feature Engineering'],
      'AI Researcher': ['Research Methodology', 'Academic Writing', 'Algorithm Design'],
      'Cybersecurity Analyst': ['Penetration Testing', 'Security Frameworks', 'Threat Analysis'],
      'Network Engineer': ['Cisco', 'Network Protocols', 'Firewall Configuration'],
      'Database Administrator': ['PostgreSQL', 'MongoDB', 'Database Optimization'],
      'Project Manager': ['Agile', 'Scrum', 'Risk Management'],
      'QA Engineer': ['Selenium', 'Test Automation', 'Performance Testing'],
      'Technical Writer': ['API Documentation', 'Technical Editing', 'Information Architecture'],
      'Systems Analyst': ['Business Process Modeling', 'Requirements Analysis', 'System Design'],
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
    
    return {
      studentName,
      fitScores,
      recommendedRoles,
      matchedSkills,
      missingSkills,
    };
  } catch (error) {
    console.error('Error in profile analysis:', error);
    throw new Error('Failed to analyze profile');
  }
};

/**
 * Simulates speech-to-text processing for interview preparation
 * @param {Blob} audioBlob - The recorded audio blob
 * @returns {Promise} - Promise that resolves to transcription and feedback
 */
export const processInterviewAudio = async (audioBlob) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real application, this would send the audio to a speech-to-text API
  // and then process the text with an LLM for feedback
  
  // Sample responses based on common interview questions
  const sampleResponses = {
    "Tell me about yourself": {
      transcription: "I'm a recent graduate with a degree in Computer Science. I've worked on several projects involving web development and data analysis. I'm particularly interested in machine learning and have completed online courses in this area. I'm looking for opportunities to apply my skills in a challenging environment where I can continue to learn and grow.",
      feedback: {
        grammar: {
          score: 90,
          suggestions: ["Consider using more varied sentence structures", "Add specific examples of projects"]
        },
        content: {
          score: 85,
          strengths: ["Clear introduction", "Mentioned relevant skills"],
          improvements: ["Could include more specific achievements", "Consider mentioning career goals"]
        },
        delivery: {
          score: 88,
          suggestions: ["Maintain a steady pace", "Use pauses effectively"]
        }
      }
    },
    "default": {
      transcription: "I believe my experience in similar projects has prepared me well for this role. I've developed strong technical skills and the ability to work effectively in teams. I'm excited about the opportunity to contribute to your organization and continue growing professionally.",
      feedback: {
        grammar: {
          score: 85,
          suggestions: ["Use more specific examples", "Vary sentence structure"]
        },
        content: {
          score: 80,
          strengths: ["Positive tone", "Mentioned teamwork"],
          improvements: ["Add specific technical skills", "Include measurable achievements"]
        },
        delivery: {
          score: 82,
          suggestions: ["Speak with more confidence", "Emphasize key points"]
        }
      }
    }
  };
  
  // Return a random response
  return Math.random() > 0.5 ? sampleResponses["Tell me about yourself"] : sampleResponses["default"];
};

/**
 * Generates additional GD topics based on selected roles
 * @param {Array} selectedRoles - Array of selected job roles
 * @returns {Promise} - Promise that resolves to additional GD topics
 */
export const generateGdTopics = async (selectedRoles) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Sample GD topics for different roles
  const topicsByRole = {
    'Software Engineer': [
      {
        title: "Microservices vs. Monolithic Architecture",
        description: "Debating the pros and cons of different architectural approaches for modern applications.",
        keyPoints: [
          "Scalability considerations",
          "Development team organization",
          "Deployment and maintenance challenges"
        ]
      },
      {
        title: "Code Quality vs. Delivery Speed",
        description: "Discussing the balance between writing perfect code and meeting business deadlines.",
        keyPoints: [
          "Technical debt implications",
          "Testing strategies",
          "Refactoring approaches"
        ]
      }
    ],
    'Data Analyst': [
      {
        title: "Big Data: Opportunity or Overrated?",
        description: "Exploring whether big data technologies deliver on their promises or create unnecessary complexity.",
        keyPoints: [
          "Cost vs. benefit analysis",
          "Use cases where traditional methods suffice",
          "Skills gap in the industry"
        ]
      },
      {
        title: "Automated Analytics vs. Human Insight",
        description: "Debating the role of automation in data analysis and the value of human interpretation.",
        keyPoints: [
          "AI-driven analytics tools",
          "Critical thinking in data interpretation",
          "Future of the data analyst role"
        ]
      }
    ],
    'default': [
      {
        title: "Remote Work: The New Normal?",
        description: "Discussing how remote work is reshaping workplace dynamics and company culture.",
        keyPoints: [
          "Productivity impacts",
          "Team collaboration challenges",
          "Work-life balance considerations"
        ]
      },
      {
        title: "Generalist vs. Specialist Career Paths",
        description: "Debating whether it's better to develop deep expertise in one area or broader knowledge across multiple domains.",
        keyPoints: [
          "Career adaptability in changing markets",
          "Value to organizations",
          "Learning strategies for each path"
        ]
      },
      {
        title: "Ethical Considerations in Technology",
        description: "Exploring the ethical responsibilities of technology professionals in product development.",
        keyPoints: [
          "Privacy and data protection",
          "Algorithmic bias",
          "Corporate responsibility"
        ]
      }
    ]
  };
  
  // Generate topics based on selected roles
  let generatedTopics = [];
  
  selectedRoles.forEach(role => {
    const roleTopics = topicsByRole[role.label] || topicsByRole['default'];
    if (roleTopics) {
      // Add 1-2 random topics from each role
      const numTopics = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numTopics && i < roleTopics.length; i++) {
        generatedTopics.push(roleTopics[i]);
      }
    }
  });
  
  // If no role-specific topics were found, return default topics
  if (generatedTopics.length === 0) {
    generatedTopics = topicsByRole['default'];
  }
  
  // Ensure we don't have duplicates
  const uniqueTopics = [];
  const titleSet = new Set();
  
  generatedTopics.forEach(topic => {
    if (!titleSet.has(topic.title)) {
      titleSet.add(topic.title);
      uniqueTopics.push(topic);
    }
  });
  
  return uniqueTopics;
};