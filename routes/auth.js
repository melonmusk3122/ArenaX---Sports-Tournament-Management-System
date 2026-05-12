const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];
    const [result] = await pool.query('INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)', [email, password_hash, username]);

    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET || 'arenax_jwt_secret_2024', { expiresIn: '7d' });
    res.status(201).json({ data: { token, user: { id: result.insertId, email, username } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'arenax_jwt_secret_2024', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, username, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;