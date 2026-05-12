const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { name, description, team_color } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ error: 'Team name is required' });
    if (name.length > 50) return res.status(400).json({ error: 'Team name must be under 50 characters' });

    const logo_path = req.file ? '/uploads/' + req.file.filename : null;
    const [result] = await pool.query(
      'INSERT INTO teams (name, description, team_color, logo_path) VALUES (?, ?, ?, ?)',
      [name.trim(), description || '', team_color || '#6C5CE7', logo_path]
    );

    await pool.query('INSERT INTO auditLog (user_id, action) VALUES (?, ?)', [req.user.id, `Created team: ${name}`]);

    const [team] = await pool.query('SELECT * FROM teams WHERE id = ?', [result.insertId]);
    res.status(201).json({ data: team[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT t.*, COUNT(p.id) as player_count
      FROM teams t LEFT JOIN players p ON t.id = p.team_id
      GROUP BY t.id ORDER BY t.created_at DESC
    `);
    res.json({ data: teams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (teams.length === 0) return res.status(404).json({ error: 'Team not found' });

    const [players] = await pool.query('SELECT * FROM players WHERE team_id = ?', [req.params.id]);
    const [matches] = await pool.query(
      'SELECT * FROM matches WHERE team1_id = ? OR team2_id = ? ORDER BY match_date DESC',
      [req.params.id, req.params.id]
    );

    res.json({ data: { ...teams[0], players, matches } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, team_color } = req.body;
    await pool.query('UPDATE teams SET name = ?, description = ?, team_color = ? WHERE id = ?',
      [name, description, team_color, req.params.id]);
    const [team] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    res.json({ data: team[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

module.exports = router;