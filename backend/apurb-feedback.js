const express = require("express");
const mysql = require("mysql2/promise");

const router = express.Router();
const pool = mysql.createPool(process.env.MYSQL_URL);

router.post("/api/apurb-feedback", async (req, res) => {
  const fields = ["name", "message", "topic", "note"];
  const values = {};

  for (const field of fields) {
    const value = req.body?.[field];

    if (typeof value !== "string" || !value.trim()) {
      return res.status(400).json({
        error: `${field} is required`,
      });
    }

    values[field] = value.trim();
  }

  if (
    values.name.length > 100 ||
    values.message.length > 255 ||
    values.topic.length > 100 ||
    values.note.length > 255
  ) {
    return res.status(400).json({
      error: "One or more fields are too long",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [messageResult] = await connection.execute(
      `INSERT INTO messages (name, message, apurb_topic)
       VALUES (?, ?, ?)`,
      [values.name, values.message, values.topic]
    );

    const [feedbackResult] = await connection.execute(
      `INSERT INTO apurb_feedback (message_id, note)
       VALUES (?, ?)`,
      [messageResult.insertId, values.note]
    );

    await connection.commit();

    return res.status(201).json({
      messageId: messageResult.insertId,
      feedbackId: feedbackResult.insertId,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    console.error("Feedback insert failed:", error);

    return res.status(500).json({
      error: "Could not save feedback",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;