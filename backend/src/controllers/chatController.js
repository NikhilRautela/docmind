const { HuggingFaceInferenceEmbeddings } = require("@langchain/community/embeddings/hf");
const Groq = require("groq-sdk");
const pool = require("../db");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question || !documentId)
      return res.status(400).json({ error: "question and documentId are required" });

    const questionEmbedding = await embeddings.embedQuery(question);

    const result = await pool.query(
      `SELECT content FROM embeddings
       WHERE document_id = $1
       ORDER BY embedding <-> $2::vector
       LIMIT 5`,
      [documentId, JSON.stringify(questionEmbedding)]
    );

    const context = result.rows.map((r) => r.content).join("\n\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Answer the user's question based only on the following document context:\n\n${context}`,
        },
        { role: "user", content: question },
      ],
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { chatWithDocument };