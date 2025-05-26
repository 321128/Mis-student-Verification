const axios = require('axios');
require('dotenv').config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/pull';
const MODELS = [
  process.env.OLLAMA_MODEL || 'mistral:latest',
  process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'
];

async function pullModels() {
  console.log('Pulling Ollama models...');
  
  for (const model of MODELS) {
    try {
      console.log(`Pulling model: ${model}`);
      await axios.post(OLLAMA_URL, { name: model });
      console.log(`Successfully pulled model: ${model}`);
    } catch (error) {
      console.error(`Error pulling model ${model}:`, error.message);
    }
  }
  
  console.log('Finished pulling models');
}

pullModels();