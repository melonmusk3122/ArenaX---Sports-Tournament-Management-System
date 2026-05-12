const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/:id/cricket/ball', authMiddleware, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { bowler_id, batter_id, runs, wicket, extras, innings_number, batting_team_id } = req.body;

    // Get or create innings
    let [innings] = await pool.query(
      'SELECT * FROM cricketInnings WHERE match_id = ? AND innings_number = ?',
      [matchId, innings_number || 1]
    );

    let inningsId;
    if (innings.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO cricketInnings (match_id, innings_number, batting_team_id) VALUES (?, ?, ?)',
        [matchId, innings_number || 1, batting_team_id]
      );
      inningsId = result.insertId;
    } else {
      inningsId = innings[0].id;
    }

    const isExtra = extras && (extras.type === 'wide' || extras.type === 'noball');
    const totalRuns = (runs || 0) + (extras ? (extras.runs || 0) : 0);

    // Update innings totals
    const ballIncrement = isExtra ? 0 : 1;

    // Get current overs
    [innings] = await pool.query('SELECT * FROM cricketInnings WHERE id = ?', [inningsId]);
    const currentInnings = innings[0];
    let currentBalls = Math.round((currentInnings.total_overs % 1) * 10);
    let currentOvers = Math.floor(currentInnings.total_overs);

    if (!isExtra) {
      currentBalls += 1;
      if (currentBalls >= 6) {
        currentOvers += 1;
        currentBalls = 0;
      }
    }

    const newOvers = currentOvers + (currentBalls / 10);
    const newWickets = currentInnings.total_wickets + (wicket ? 1 : 0);

    await pool.query(
      'UPDATE cricketInnings SET total_runs = total_runs + ?, total_wickets = ?, total_overs = ? WHERE id = ?',
      [totalRuns, newWickets, newOvers, inningsId]
    );

    // Update or create batting record
    const [existingBat] = await pool.query(
      'SELECT * FROM cricketBatting WHERE innings_id = ? AND player_id = ?', [inningsId, batter_id]
    );
    if (existingBat.length === 0) {
      await pool.query(
        'INSERT INTO cricketBatting (innings_id, player_id, runs, balls, fours, sixes) VALUES (?, ?, ?, ?, ?, ?)',
        [inningsId, batter_id, runs || 0, isExtra ? 0 : 1, runs === 4 ? 1 : 0, runs === 6 ? 1 : 0]
      );
    } else {
      await pool.query(
        `UPDATE cricketBatting SET runs = runs + ?, balls = balls + ?, fours = fours + ?, sixes = sixes + ? WHERE innings_id = ? AND player_id = ?`,
        [runs || 0, isExtra ? 0 : 1, runs === 4 ? 1 : 0, runs === 6 ? 1 : 0, inningsId, batter_id]
      );
    }

    // Update or create bowling record
    const [existingBowl] = await pool.query(
      'SELECT * FROM cricketBowling WHERE innings_id = ? AND player_id = ?', [inningsId, bowler_id]
    );
    if (existingBowl.length === 0) {
      await pool.query(
        'INSERT INTO cricketBowling (innings_id, player_id, balls, runs, wickets) VALUES (?, ?, ?, ?, ?)',
        [inningsId, bowler_id, isExtra ? 0 : 1, totalRuns, wicket ? 1 : 0]
      );
    } else {
      await pool.query(
        'UPDATE cricketBowling SET balls = balls + ?, runs = runs + ?, wickets = wickets + ? WHERE innings_id = ? AND player_id = ?',
        [isExtra ? 0 : 1, totalRuns, wicket ? 1 : 0, inningsId, bowler_id]
      );
    }

    // Update match status to live
    await pool.query("UPDATE matches SET status = 'live' WHERE id = ? AND status = 'upcoming'", [matchId]);

    // Return updated scorecard
    const [updatedInnings] = await pool.query('SELECT * FROM cricketInnings WHERE id = ?', [inningsId]);
    res.json({ data: updatedInnings[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record ball' });
  }
});

router.get('/:id/scorecard', authMiddleware, async (req, res) => {
  try {
    const [match] = await pool.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
    if (match.length === 0) return res.status(404).json({ error: 'Match not found' });

    if (match[0].sport === 'cricket') {
      const [innings] = await pool.query('SELECT * FROM cricketInnings WHERE match_id = ? ORDER BY innings_number', [req.params.id]);
      for (let inn of innings) {
        const [batting] = await pool.query(
          'SELECT cb.*, p.name, p.jersey_number FROM cricketBatting cb JOIN players p ON cb.player_id = p.id WHERE cb.innings_id = ?',
          [inn.id]
        );
        const [bowling] = await pool.query(
          'SELECT cbo.*, p.name, p.jersey_number FROM cricketBowling cbo JOIN players p ON cbo.player_id = p.id WHERE cbo.innings_id = ?',
          [inn.id]
        );
        inn.batting = batting;
        inn.bowling = bowling;
      }
      res.json({ innings });
    } else {
      const [events] = await pool.query(`
        SELECT fe.*, p.name as player_name, a.name as assister_name, t.name as team_name
        FROM footballEvents fe
        JOIN players p ON fe.player_id = p.id
        LEFT JOIN players a ON fe.assister_id = a.id
        JOIN teams t ON fe.team_id = t.id
        WHERE fe.match_id = ? ORDER BY fe.minute
      `, [req.params.id]);
      res.json({ events });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scorecard' });
  }
});

module.exports = router;