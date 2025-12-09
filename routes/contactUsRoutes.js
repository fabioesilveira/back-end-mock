const express = require("express");
const connection = require("../connection");

const router = express.Router();

router.get("/", async (req, res) => {
    const [result] = await connection.execute(
        "SELECT id, name, email, orderNumber, phone, subject, message FROM contactUs"
    );
    return res.json(result);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const [result] = await connection.execute(
        "SELECT id, name, email, orderNumber, phone, subject, message FROM contactUs WHERE id = ?",
        [id]
    );

    if (result.length === 0) {
        return res.status(404).json({ msg: "Contact not found" });
    }

    return res.json(result[0]); // só um registro
});

router.post("/", async (req, res) => {
    const { name, email, orderNumber, phone, subject, message } = req.body;

    const [result] = await connection.execute(
        `INSERT INTO contactUs (name, email, orderNumber, phone, subject, message)
    VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, orderNumber, phone, subject, message]
    );

    return res.json(result);
});

module.exports = router;