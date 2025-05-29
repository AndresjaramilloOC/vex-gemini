const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { marked } = require('marked'); // 👈 NUEVO
require('dotenv').config();

const app = express();
const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());
const staticPath = path.join(__dirname, 'public');
console.log("Sirviendo archivos estáticos desde:", staticPath);
app.use(express.static(staticPath));

app.post('/chat', async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: userPrompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log("Respuesta cruda de Gemini:", JSON.stringify(response.data, null, 2));

    const markdownReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    const htmlReply = marked.parse(markdownReply); // 👈 convierte Markdown a HTML
    res.json({ response: htmlReply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Error consultando Gemini' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
