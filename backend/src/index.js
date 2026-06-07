const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uploadRoute = require("./routes/upload");
const chatRoute = require("./routes/chat");

app.use("/api/upload", uploadRoute);
app.use("/api/chat", chatRoute);

app.get("/", (req, res) => {
  res.json({ message: "DocMind API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});