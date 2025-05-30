const axios = require('axios');
require('dotenv').config();

const OLLAMA_URL = process.env.OLLAMA_API_URL;
const MODEL = process.env.OLLAMA_EMBED_MODEL;

/**
 * Genera un embedding para el texto proporcionado usando Ollama.
 * @param {string} text - El texto a convertir en embedding.
 * @returns {Promise<number[] | null>}
 */
async function generateEmbedding(text) {
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
      model: MODEL,
      prompt: text,
    });

    return response.data.embedding;
  } catch (error) {
    console.error("❌ Error al obtener el embedding:", error.response?.data || error.message);
    return null;
  }
}

module.exports = generateEmbedding;
