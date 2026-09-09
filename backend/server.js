const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool(process.env.MYSQL_URL);

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  console.log("Connected to MySQL");
  connection.release();
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


app.post("/api/pronob", (req, res) => {
  const { name, message, note } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof message !== "string" ||
    typeof note !== "string"
  ) {
    return res.status(400).json({
      error: "Name, message, and note must be strings",
    });
  }

  const trimmedName = name.trim();
  const trimmedMessage = message.trim();
  const trimmedNote = note.trim();

  if (
    !trimmedName ||
    !trimmedMessage ||
    !trimmedNote ||
    trimmedName.length > 100 ||
    trimmedMessage.length > 255 ||
    trimmedNote.length > 255
  ) {
    return res.status(400).json({
      error:
        "Name, message, and note must be non-blank and within their length limits",
    });
  }

  const messageSql =
    "INSERT INTO messages (name, message, pronob_note) VALUES (?, ?, ?)";
  const pronobSql =
    "INSERT INTO pronob_entries (message_id, note) VALUES (?, ?)";

  let connection;

  db.promise()
    .getConnection()
    .then(async (reservedConnection) => {
      connection = reservedConnection;

      try {
        await connection.beginTransaction();

        const [result] = await connection.query(messageSql, [
          trimmedName,
          trimmedMessage,
          trimmedNote,
        ]);

        await connection.query(pronobSql, [result.insertId, trimmedNote]);
        await connection.commit();

        res.status(201).json({
          id: result.insertId,
          name: trimmedName,
          message: trimmedMessage,
          note: trimmedNote,
        });
      } catch (err) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error("Transaction rollback failed:", rollbackError);
        }

        console.error("Pronob transaction failed:", err);
        res.status(500).json({
          error: "Failed to save Pronob entry",
        });
      } finally {
        connection.release();
      }
    })
    .catch((err) => {
      console.error("Failed to reserve database connection:", err);
      res.status(500).json({
        error: "Failed to save Pronob entry",
      });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
