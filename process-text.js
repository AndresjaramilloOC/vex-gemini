const generateEmbedding = require('./embeddings/generateEmbedding');

async function run() {
  const text = 'Este es un ejemplo para generar embeddings.';
  console.log("📨 Texto:", text);

  const embedding = await generateEmbedding(text);

  if (embedding) {
    console.log("✅ Embedding generado:");
    console.log(embedding.slice(0, 10), '...'); // muestra primeros valores
  } else {
    console.log("⚠️ No se pudo generar el embedding.");
  }
}

run();
