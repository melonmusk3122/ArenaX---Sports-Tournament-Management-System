const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { team1_id, team2_id, sport, venue, match_date, format, players } = req.body;
    if (!team1_id || !team2_id) return res.status(400).json({ error: 'Both teams are required' });
    if (team1_id === team2_id) return res.status(400).json({ error: 'Teams must be different' });
    if (!sport) return res.status(400).json({ error: 'Sport is required' });

    if (players) {
      const t1Players = players.filter(p => p.team_id === team1_id || p.team_id == team1_id);
      const t2Players = players.filter(p => p.team_id === team2_id || p.team_id == team2_id);
      if (t1Players.length !== 11 || t2Players.length !== 11) {
        return res.status(400).json({ error: 'Each team must have exactly 11 players selected' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO matches (team1_id, team2_id, sport, venue, match_date, format) VALUES (?, ?, ?, ?, ?, ?)',
      [team1_id, team2_id, sport, venue || 'TBD', match_date || new Date(), format || 'T20']
    );

    const matchId = result.insertId;

    if (players && players.length > 0) {
      const values = players.map(p => [matchId, p.player_id || p.id, p.team_id]);
      await pool.query('INSERT INTO matchPlayers (match_id, player_id, team_id) VALUES ?', [values]);
    }

    await pool.query('INSERT INTO auditLog (user_id, action) VALUES (?, ?)', [req.user.id, `Created match #${matchId}`]);

    const [match] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    res.status(201).json({ data: match[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, sport } = req.query;
    let query = `
      SELECT m.*, t1.name as team1_name, t1.team_color as team1_color, t1.logo_path as team1_logo,
      t2.name as team2_name, t2.team_color as team2_color, t2.logo_path as team2_logo
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
    `;
    const conditions = [];
    const params = [];
    if (status && status !== 'all') { conditions.push('m.status = ?'); params.push(status); }
    if (sport && sport !== 'all') { conditions.push('m.sport = ?'); params.push(sport); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY m.match_date DESC';

    const [matches] = await pool.query(query, params);
    res.json({ data: matches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [matches] = await pool.query(`
      SELECT m.*, t1.name as team1_name, t1.team_color as team1_color, t1.logo_path as team1_logo,
      t2.name as team2_name, t2.team_color as team2_color, t2.logo_path as team2_logo
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      WHERE m.id = ?
    `, [req.params.id]);
    if (matches.length === 0) return res.status(404).json({ error: 'Match not found' });

    const match = matches[0];
    const [matchPlayers] = await pool.query(`
      SELECT mp.*, p.name, p.jersey_number, p.role
      FROM matchPlayers mp JOIN players p ON mp.player_id = p.id WHERE mp.match_id = ?
    `, [req.params.id]);

    match.players = matchPlayers;

    if (match.sport === 'cricket') {
      const [innings] = await pool.query('SELECT * FROM cricketInnings WHERE match_id = ? ORDER BY innings_number', [req.params.id]);
      for (let inn of innings) {
        const [batting] = await pool.query(`
          SELECT cb.*, p.name, p.jersey_number FROM cricketBatting cb JOIN players p ON cb.player_id = p.id WHERE cb.innings_id = ?
        `, [inn.id]);
        const [bowling] = await pool.query(`
          SELECT cbo.*, p.name, p.jersey_number FROM cricketBowling cbo JOIN players p ON cbo.player_id = p.id WHERE cbo.innings_id = ?
        `, [inn.id]);
        inn.batting = batting;
        inn.bowling = bowling;
      }
      match.innings = innings;
    } else {
      const [events] = await pool.query(`
        SELECT fe.*, p.name as player_name, p.jersey_number,
        a.name as assister_name, t.name as team_name
        FROM footballEvents fe
        JOIN players p ON fe.player_id = p.id
        LEFT JOIN players a ON fe.assister_id = a.id
        JOIN teams t ON fe.team_id = t.id
        WHERE fe.match_id = ? ORDER BY fe.minute
      `, [req.params.id]);
      match.events = events;
    }

    res.json({ data: match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, result_summary } = req.body;
    await pool.query('UPDATE matches SET status = ?, result_summary = ? WHERE id = ?',
      [status, result_summary || null, req.params.id]);
    const [match] = await pool.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
    res.json({ data: match[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match status' });
  }
});

module.exports = router;