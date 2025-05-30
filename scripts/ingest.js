const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const generateEmbedding = require('../embeddings/generateEmbedding');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const PDF_DIR = path.join(__dirname, '../pdfs');

function chunkText(text, size = 300) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function processPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const chunks = chunkText(data.text);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    if (embedding) {
      const { error } = await supabase.from('documents').insert([
        {
          content: chunk,
          embedding,
          metadata: { file: path.basename(filePath) }
        }
      ]);
      if (error) console.error('❌ Supabase insert error:', error.message);
    }
  }
  console.log(`✅ Procesado ${path.basename(filePath)}`);
}

async function runIngestion() {
  const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));

  for (const file of files) {
    const fullPath = path.join(PDF_DIR, file);
    await processPDF(fullPath);
  }
}

runIngestion();
