const express = require("express");
const connection = require("../connection");

const router = express.Router();

/**
 * GET /contact-us
 * Query params opcionais:
 * - replied=0|1   (filtra inbox/replied)
 * - email=texto   (filtra por email com LIKE)
 *
 * Exemplos:
 *  /contact-us?replied=0
 *  /contact-us?replied=1
 *  /contact-us?replied=0&email=gmail.com
 */
router.get("/", async (req, res) => {
  try {
    const { replied, email } = req.query;

    let sql = `
      SELECT 
        id, name, email, orderNumber, phone, subject, message,
        created_at, replied, replied_at
      FROM contactUs
      WHERE 1=1
    `;
    const params = [];

    if (replied !== undefined) {
      sql += " AND replied = ?";
      params.push(Number(replied) ? 1 : 0);
    }

    if (email) {
      sql += " AND email LIKE ?";
      params.push(`%${email}%`);
    }

    sql += " ORDER BY created_at DESC";

    const [result] = await connection.execute(sql, params);
    return res.json(result);
  } catch (err) {
    console.error("CONTACT-US GET ERROR:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

/**
 * GET /contact-us/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await connection.execute(
      `
      SELECT 
        id, name, email, orderNumber, phone, subject, message,
        created_at, replied, replied_at
      FROM contactUs
      WHERE id = ?
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ msg: "Contact not found" });
    }

    return res.json(result[0]);
  } catch (err) {
    console.error("CONTACT-US GET/:id ERROR:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

/**
 * POST /contact-us
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, orderNumber, phone, subject, message } = req.body;

    const [result] = await connection.execute(
      `
      INSERT INTO contactUs (name, email, orderNumber, phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email, orderNumber ?? 0, phone ?? null, subject, message]
    );

    const [rows] = await connection.execute(
      `
      SELECT 
        id, name, email, orderNumber, phone, subject, message,
        created_at, replied, replied_at
      FROM contactUs
      WHERE id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("CONTACT-US POST ERROR:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

/**
 * PATCH /contact-us/:id/reply
 * marca como respondida (replied=1 e replied_at=NOW())
 */
router.patch("/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;

    const [update] = await connection.execute(
      `
      UPDATE contactUs
      SET replied = 1,
          replied_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    if (update.affectedRows === 0) {
      return res.status(404).json({ msg: "Message not found" });
    }

    const [rows] = await connection.execute(
      `
      SELECT 
        id, name, email, orderNumber, phone, subject, message,
        created_at, replied, replied_at
      FROM contactUs
      WHERE id = ?
      `,
      [id]
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error("CONTACT-US PATCH reply ERROR:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;

