const axios = require('axios');

/**
 * Sends data to an LLM endpoint for generating a personalized document
 * @param {Object} studentData - Student profile data
 * @param {string} jobDescription - Job description text
 * @returns {Promise<string>} - Promise resolving to LLM response
 */
const generatePersonalizedDocument = async (studentData, jobDescription) => {
  try {
    // Check which LLM endpoint to use based on environment variables
    const endpoint = process.env.LLM_ENDPOINT || 'openai'; // Default to OpenAI
    
    if (endpoint === 'openai') {
      return await callOpenAI(studentData, jobDescription);
    } else if (endpoint === 'ollama') {
      return await callOllama(studentData, jobDescription);
    } else {
      throw new Error(`Unsupported LLM endpoint: ${endpoint}`);
    }
  } catch (error) {
    throw new Error(`Error calling LLM service: ${error.message}`);
  }
};

/**
 * Generates embeddings for text using Ollama
 * @param {string} text - Text to generate embeddings for
 * @returns {Promise<Array<number>>} - Promise resolving to embedding vector
 */
const generateEmbeddings = async (text) => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/embeddings';
    const ollamaModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
    
    const response = await axios.post(
      ollamaUrl,
      {
        model: ollamaModel,
        prompt: text
      }
    );
    
    return response.data.embedding;
  } catch (error) {
    throw new Error(`Error generating embeddings: ${error.message}`);
  }
};

/**
 * Calls OpenAI API to generate a personalized document
 * @param {Object} studentData - Student profile data
 * @param {string} jobDescription - Job description text
 * @returns {Promise<string>} - Promise resolving to OpenAI response
 */
const callOpenAI = async (studentData, jobDescription) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a career counselor analyzing a student profile against a job description. Provide a detailed analysis of how well the student matches the job, highlighting strengths, areas for improvement, and specific recommendations.'
          },
          {
            role: 'user',
            content: `
              Student Profile:
              ${JSON.stringify(studentData, null, 2)}
              
              Job Description:
              ${jobDescription}
              
              Please provide a detailed analysis of how well this student matches the job description. Include:
              1. Overall match assessment
              2. Key strengths relevant to the position
              3. Skills gaps and areas for improvement
              4. Specific recommendations for the student to better prepare for this role
              5. Suggested resources or courses that would help the student
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Calls Ollama API to generate a personalized document
 * @param {Object} studentData - Student profile data
 * @param {string} jobDescription - Job description text
 * @returns {Promise<string>} - Promise resolving to Ollama response
 */
const callOllama = async (studentData, jobDescription) => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral:latest';

    const response = await axios.post(
      ollamaUrl,
      {
        model: ollamaModel,
        prompt: `
          You are a career counselor analyzing a student profile against a job description. Provide a detailed analysis of how well the student matches the job, highlighting strengths, areas for improvement, and specific recommendations.
          
          Student Profile:
          ${JSON.stringify(studentData, null, 2)}
          
          Job Description:
          ${jobDescription}
          
          Please provide a detailed analysis of how well this student matches the job description. Include:
          1. Overall match assessment (with a percentage score)
          2. Key strengths relevant to the position
          3. Skills gaps and areas for improvement
          4. Specific recommendations for the student to better prepare for this role
          5. Suggested resources or courses that would help the student
          6. A personalized career development plan
          
          Format your response in a professional manner suitable for a PDF report. Use clear headings and bullet points where appropriate.
        `,
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      }
    );

    return response.data.response;
  } catch (error) {
    throw new Error(`Ollama API error: ${error.message}`);
  }
};

module.exports = {
  generatePersonalizedDocument,
  generateEmbeddings
};