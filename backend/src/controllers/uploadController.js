const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { HuggingFaceInferenceEmbeddings } = require("@langchain/community/embeddings/hf");
const pool = require("../db");

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const loader = new PDFLoader(file.path);
    const docs = await loader.load();

    const docResult = await pool.query(
      "INSERT INTO documents (filename) VALUES ($1) RETURNING id",
      [file.originalname]
    );
    const documentId = docResult.rows[0].id;

    for (const doc of docs) {
      const embedding = await embeddings.embedQuery(doc.pageContent);
      await pool.query(
        "INSERT INTO embeddings (document_id, content, embedding) VALUES ($1, $2, $3)",
        [documentId, doc.pageContent, JSON.stringify(embedding)]
      );
    }

    res.json({ message: "Document uploaded successfully", documentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadDocument };