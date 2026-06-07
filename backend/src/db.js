const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const createTables = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS vector;
    
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS embeddings (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id),
      content TEXT NOT NULL,
      embedding vector(1536),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("Tables created successfully");
};

createTables().catch(console.error);

module.exports = pool;