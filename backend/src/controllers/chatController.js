const { OpenAIEmbeddings } = require("@langchain/openai");
const { OpenAI } = require("openai");
const pool = require("../db");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question || !documentId)
      return res.status(400).json({ error: "question and documentId are required" });

    // Convert question to embedding
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const questionEmbedding = await embeddings.embedQuery(question);

    // Find most similar chunks from DB
    const result = await pool.query(
      `SELECT content FROM embeddings
       WHERE document_id = $1
       ORDER BY embedding <-> $2::vector
       LIMIT 5`,
      [documentId, JSON.stringify(questionEmbedding)]
    );

    const context = result.rows.map((r) => r.content).join("\n\n");

    // Ask OpenAI with context
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
