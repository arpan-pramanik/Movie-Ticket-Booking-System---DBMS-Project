const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /register
const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        // Check if email already exists
        const [existing] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Insert into Users
        const [userResult] = await pool.query(
            'INSERT INTO Users (name, email) VALUES (?, ?)',
            [name, email]
        );
        const userId = userResult.insertId;

        // Hash password and insert into Auth
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO Auth (user_id, password) VALUES (?, ?)',
            [userId, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', user_id: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// POST /login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Join Users + Auth
        const [rows] = await pool.query(
            `SELECT u.user_id, u.name, u.email, a.password 
       FROM Users u 
       JOIN Auth a ON u.user_id = a.user_id 
       WHERE u.email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { user_id: user.user_id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = { register, login };
