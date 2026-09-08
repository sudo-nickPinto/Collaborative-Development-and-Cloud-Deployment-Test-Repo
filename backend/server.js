const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.post("/api/taha-messages", (req, res) => {
  const { name, message, category } = req.body;

  if (
    typeof name !== "string" ||
    typeof message !== "string" ||
    typeof category !== "string" ||
    !name.trim() ||
    !message.trim() ||
    !category.trim()
  ) {
    return res.status(400).json({
      error: "Name, message, and category are required",
    });
  }

  const tahaMessage = {
    name: name.trim(),
    message: message.trim(),
    category: category.trim(),
  };

  if (
    tahaMessage.name.length > 100 ||
    tahaMessage.message.length > 255 ||
    tahaMessage.category.length > 100
  ) {
    return res.status(400).json({
      error: "One or more fields exceed the allowed length",
    });
  }

  db.beginTransaction((transactionError) => {
    if (transactionError) {
      console.error("Transaction failed to start:", transactionError);
      return res.status(500).json({ error: "Failed to save Taha's message" });
    }

    const messageSql = `
      INSERT INTO messages (name, message, taha_category)
      VALUES (?, ?, ?)
    `;

    db.query(
      messageSql,
      [tahaMessage.name, tahaMessage.message, tahaMessage.category],
      (messageError, messageResult) => {
        if (messageError) {
          return db.rollback(() => {
            console.error("Main table insert failed:", messageError);
            res.status(500).json({ error: "Failed to save Taha's message" });
          });
        }

        const tahaSql = `
          INSERT INTO taha_messages (message_id, name, message, category)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          tahaSql,
          [
            messageResult.insertId,
            tahaMessage.name,
            tahaMessage.message,
            tahaMessage.category,
          ],
          (tahaError, tahaResult) => {
            if (tahaError) {
              return db.rollback(() => {
                console.error("Taha table insert failed:", tahaError);
                res.status(500).json({ error: "Failed to save Taha's message" });
              });
            }

            db.commit((commitError) => {
              if (commitError) {
                return db.rollback(() => {
                  console.error("Transaction commit failed:", commitError);
                  res.status(500).json({ error: "Failed to save Taha's message" });
                });
              }

              res.status(201).json({
                messageId: messageResult.insertId,
                tahaMessageId: tahaResult.insertId,
                ...tahaMessage,
              });
            });
          },
        );
      },
    );
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
