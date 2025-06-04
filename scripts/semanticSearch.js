const { createClient } = require('@supabase/supabase-js');
const generateEmbedding = require('../embeddings/generateEmbedding');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Realiza una búsqueda semántica usando embeddings y Supabase.
 * @param {string} query - Pregunta del usuario.
 * @param {number} matchCount - Cantidad de resultados a devolver.
 * @param {number} matchThreshold - Umbral mínimo de similitud (0 a 1).
 * @returns {Promise<Array>} Documentos más similares.
 */
async function searchDocs(query, matchCount = 5, matchThreshold = 0.75) {
  const embedding = await generateEmbedding(query);
  if (!embedding) return [];

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: matchCount,
    match_threshold: matchThreshold
  });

  if (error) {
    console.error('❌ Error en búsqueda semántica:', error.message);
    return [];
  }

  return data;
}

module.exports = searchDocs;
