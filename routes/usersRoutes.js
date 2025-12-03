const express = require("express");
const connection = require("../connection");

const router = express.Router();

router.get("/admin", async (req, res) => {
    const [result] = await connection.execute("SELECT * FROM users");
    return res.json(result);
});

router.get("/", async (req, res) => {
    const [result] = await connection.execute(
        "SELECT id, fullName, phone, email FROM users WHERE type = 'normal'"
    );
    return res.json(result);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const [result] = await connection.execute(
        "SELECT id, fullName, phone, email FROM users WHERE id = ?",
        [id]
    );

    if (result.length === 0) {
        return res.json({ msg: "cannot find" });
    }
    return res.json(result);
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, number, password } = req.body;

        // basic validation
        if (!name || !email || !number || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // check if email already exists
        const [existing] = await connection.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ msg: "User already exists" });
        }

        // insert new user
        const [result] = await connection.execute(
            `INSERT INTO users (fullName, phone, email, password, type)
       VALUES (?, ?, ?, ?, ?)`,
            [name, number, email, password, "normal"]
        );

        return res.status(201).json({
            id: result.insertId,
            fullName: name,
            email,
            type: "normal",
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Email and password are required" });
    }

    const [result] = await connection.execute(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );

    // usuário não encontrado
    if (result.length === 0) {
        return res.status(404).json({ msg: "User not found" });
    }

    const user = result[0];

    // senha errada
    if (user.password !== password) {
        return res.status(401).json({ msg: "Invalid password" });
    }

    // sucesso
    const data = {
        userName: user.fullName,
        email: user.email,
        type: user.type,
        id: user.id,
    };

    return res.status(200).json(data);
});


router.put("/:id", async (req, res) => {
    const { password } = req.body; // fixed
    const { id } = req.params;

    const [result] = await connection.execute(
        `UPDATE users SET password = ? WHERE id = ?`, //fixed
        [password, id]
    );

    return res.json(result);
});

router.delete("/removeUser", async (req, res) => {
    const { email, password } = req.body;

    const [result] = await connection.execute(
        `
     DELETE FROM users
     WHERE email = ?
     AND password = ?
    `,
        [email, password]
    );

    return res.json(result);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const [result] = await connection.execute(
        `DELETE FROM users where id = ?`,
        [id]
    );
    return res.json(result);
});

module.exports = router;
