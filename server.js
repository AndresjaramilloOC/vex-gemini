const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { marked } = require('marked');
require('dotenv').config();

const searchDocs = require('./scripts/semanticSearch');

const app = express();
const PORT = 3000;

const API_KEY = process.env.GEMINI_API_KEY;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL;
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL;

// Middleware
app.use(cors());
app.use(express.json());
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));
console.log("✅ Sirviendo archivos estáticos desde:", staticPath);

// Ruta principal del chat
app.post('/chat', async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    // Paso 1: Obtener fragmentos relevantes desde Supabase
    const matches = await searchDocs(userPrompt, 8); // puedes ajustar a más o menos contexto
    if (!matches || matches.length === 0) {
      return res.json({ response: "Lo siento, esa información no se encuentra en los documentos disponibles." });
    }

    // Paso 2: Armar el contexto para Gemini
    const context = matches.map(m => m.content).join('\n');

    // Paso 3: Enviar a Gemini con el contexto + pregunta
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{
              text: `A continuación tienes fragmentos de un libro. Usa SOLO esta información para responder a la pregunta que viene después. Si no encuentras suficiente información, di que no puedes responder.

### Fragmentos:
${context}

### Pregunta:
${userPrompt}`
            }]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const markdownReply = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
    const htmlReply = marked.parse(markdownReply);
    res.json({ response: htmlReply });

  } catch (error) {
    console.error("❌ Error general:", error.response?.data || error.message);
    res.status(500).json({ error: 'Error procesando la solicitud.' });
  }
});

// Ruta para redirigir a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
