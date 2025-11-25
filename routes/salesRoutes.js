const express = require("express");
const connection = require("../connection");

const router = express.Router();

router.get("/", async (req, res) => {
    const [result] = await connection.execute("SELECT * FROM sales");
    return res.json(result);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const [result] = await connection.execute(
        `SELECT * FROM sales where id = ?`, [id]
    );

    if (result.length === 0) {
        return res.json({ msg: "cannot find" });
    }

    return res.json(result);
});

router.post("/", async (req, res) => {
    const { status, items, total, user_id } = req.body;

    const [result] = await connection.execute(
        `INSERT INTO sales (status, items, total, user_id)
    VALUES (?, ?, ?, ?)`,
        [status, items, total, user_id]
    );

    return res.json(result);
});

router.put("/:id", async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const [result] = await connection.execute(
        `UPDATE products SET status = ? WHERE id = ?`,
        [status, id]
    );

    return res.json(result);
});

module.exports = router;