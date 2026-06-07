const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { OpenAIEmbeddings } = require("@langchain/openai");
const pool = require("../db");

const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Load and split PDF into chunks
    const loader = new PDFLoader(file.path);
    const docs = await loader.load();

    // Save document record to DB
    const docResult = await pool.query(
      "INSERT INTO documents (filename) VALUES ($1) RETURNING id",
      [file.originalname]
    );
    const documentId = docResult.rows[0].id;

    // Generate embeddings and save
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

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