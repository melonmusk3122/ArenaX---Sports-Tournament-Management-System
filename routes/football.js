const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/:id/football/event', authMiddleware, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { event_type, player_id, minute, assister_id, team_id } = req.body;

    if (!event_type || !player_id || minute === undefined || !team_id) {
      return res.status(400).json({ error: 'event_type, player_id, minute, and team_id are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO footballEvents (match_id, event_type, player_id, assister_id, minute, team_id) VALUES (?, ?, ?, ?, ?, ?)',
      [matchId, event_type, player_id, assister_id || null, minute, team_id]
    );

    // Update match status to live
    await pool.query("UPDATE matches SET status = 'live' WHERE id = ? AND status = 'upcoming'", [matchId]);

    // Update player stats for goals
    if (event_type === 'goal') {
      await pool.query('UPDATE playerStats SET runs_or_goals = runs_or_goals + 1 WHERE player_id = ?', [player_id]);
      if (assister_id) {
        await pool.query('UPDATE playerStats SET wickets_or_assists = wickets_or_assists + 1 WHERE player_id = ?', [assister_id]);
      }
    }

    const [event] = await pool.query(`
      SELECT fe.*, p.name as player_name, a.name as assister_name, t.name as team_name
      FROM footballEvents fe
      JOIN players p ON fe.player_id = p.id
      LEFT JOIN players a ON fe.assister_id = a.id
      JOIN teams t ON fe.team_id = t.id
      WHERE fe.id = ?
    `, [result.insertId]);

    res.status(201).json({ data: event[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

module.exports = router;