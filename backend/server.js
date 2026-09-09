const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(require("./apurb-feedback"));

const db = mysql.createConnection(process.env.MYSQL_URL);

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  console.log("Connected to MySQL");
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/api/messages", (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({
      error: "Name and message are required",
    });
  }

  const sql = "INSERT INTO messages (name, message) VALUES (?, ?)";

  db.query(sql, [name, message], (err, result) => {
    if (err) {
      console.error("Insert failed:", err);

      return res.status(500).json({
        error: "Failed to insert message",
      });
    }

    res.status(201).json({
      id: result.insertId,
      name,
      message,
    });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});