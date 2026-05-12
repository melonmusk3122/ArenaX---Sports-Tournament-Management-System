const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/teams/:teamId/players', authMiddleware, async (req, res) => {
  try {
    const { name, jersey_number, role } = req.body;
    if (!name) return res.status(400).json({ error: 'Player name is required' });
    if (!jersey_number) return res.status(400).json({ error: 'Jersey number is required' });
    if (!role) return res.status(400).json({ error: 'Role is required' });

    const [result] = await pool.query(
      'INSERT INTO players (team_id, name, jersey_number, role) VALUES (?, ?, ?, ?)',
      [req.params.teamId, name, jersey_number, role]
    );

    await pool.query(
      'INSERT INTO playerStats (player_id, matches_played, runs_or_goals, wickets_or_assists) VALUES (?, 0, 0, 0)',
      [result.insertId]
    );

    await pool.query('INSERT INTO auditLog (user_id, action) VALUES (?, ?)', [req.user.id, `Added player: ${name}`]);

    const [player] = await pool.query('SELECT * FROM players WHERE id = ?', [result.insertId]);
    res.status(201).json({ data: player[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add player' });
  }
});

router.get('/teams/:teamId/players', authMiddleware, async (req, res) => {
  try {
    const [players] = await pool.query('SELECT * FROM players WHERE team_id = ? ORDER BY jersey_number', [req.params.teamId]);
    res.json({ data: players });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

router.get('/players/:id', authMiddleware, async (req, res) => {
  try {
    const [players] = await pool.query(`
      SELECT p.*, t.name as team_name, t.team_color
      FROM players p JOIN teams t ON p.team_id = t.id WHERE p.id = ?
    `, [req.params.id]);
    if (players.length === 0) return res.status(404).json({ error: 'Player not found' });

    const [stats] = await pool.query('SELECT * FROM playerStats WHERE player_id = ?', [req.params.id]);

    res.json({ data: { ...players[0], stats: stats[0] || { matches_played: 0, runs_or_goals: 0, wickets_or_assists: 0 } } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

module.exports = router;