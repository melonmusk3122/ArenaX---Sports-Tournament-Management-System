import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const CricketScoring = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inningsNumber, setInningsNumber] = useState(1);
  const [form, setForm] = useState({ batter_id: '', bowler_id: '', runs: 0, wicket: false, extras: null });
  const [scorecard, setScorecard] = useState({ innings: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data.data);
      if (res.data.data.innings) setScorecard({ innings: res.data.data.innings });
    } catch (err) { toast.error('Failed to load match'); }
    setLoading(false);
  };

  useEffect(() => { fetchMatch(); }, [matchId]);

  const handleBall = async () => {
    if (!form.batter_id || !form.bowler_id) { toast.error('Select batter and bowler'); return; }
    setSubmitting(true);
    try {
      const battingTeam = inningsNumber === 1 ? match.team1_id : match.team2_id;
      await api.post(`/matches/${matchId}/cricket/ball`, {
        ...form, innings_number: inningsNumber, batting_team_id: battingTeam
      });
      toast.success(`${form.runs} run${form.runs !== 1 ? 's' : ''}${form.wicket ? ' + WICKET!' : ''}`);
      setForm({ ...form, runs: 0, wicket: false, extras: null });
      fetchMatch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to record ball'); }
    setSubmitting(false);
  };

  const completeMatch = async () => {
    try {
      const inn = scorecard.innings;
      let summary = '';
      if (inn.length >= 2) {
        const diff = inn[0].total_runs - inn[1].total_runs;
        const team1Name = match.team1_name;
        const team2Name = match.team2_name;
        if (diff > 0) summary = `${team1Name} won by ${diff} runs`;
        else if (diff < 0) summary = `${team2Name} won by ${10 - inn[1].total_wickets} wickets`;
        else summary = 'Match tied';
      }
      await api.put(`/matches/${matchId}/status`, { status: 'completed', result_summary: summary });
      toast.success('Match completed!');
      navigate(`/match/${matchId}`);
    } catch (err) { toast.error('Failed to complete match'); }
  };

  const cardStyle = { background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };

  if (loading) return <LoadingSpinner />;
  if (!match) return <div style={{ color: '#E8E8EE' }}>Match not found</div>;

  const battingTeamPlayers = match.players?.filter(p =>
    inningsNumber === 1 ? p.team_id === match.team1_id : p.team_id === match.team2_id
  ) || [];
  const bowlingTeamPlayers = match.players?.filter(p =>
    inningsNumber === 1 ? p.team_id === match.team2_id : p.team_id === match.team1_id
  ) || [];

  const currentInnings = scorecard.innings?.find(i => i.innings_number === inningsNumber);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate('/match-history')} style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>← Back</button>

      <div style={{ ...cardStyle, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginBottom: 16 }}>
          <div>
            <h3 style={{ color: '#E8E8EE', fontSize: 20, fontWeight: 700 }}>{match.team1_name}</h3>
          </div>
          <span style={{ color: '#8892B0', fontSize: 14 }}>vs</span>
          <div>
            <h3 style={{ color: '#E8E8EE', fontSize: 20, fontWeight: 700 }}>{match.team2_name}</h3>
          </div>
        </div>
        {currentInnings && (
          <div style={{ fontSize: 48, fontWeight: 800, color: '#6C5CE7' }}>
            {currentInnings.total_runs}/{currentInnings.total_wickets}
            <span style={{ fontSize: 18, color: '#8892B0', fontWeight: 400, marginLeft: 12 }}>
              ({Math.floor(currentInnings.total_overs)}.{Math.round((currentInnings.total_overs % 1) * 10)} ov)
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          {[1, 2].map(n => (
            <button key={n} onClick={() => setInningsNumber(n)}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: inningsNumber === n ? '#6C5CE7' : 'rgba(255,255,255,0.05)', color: inningsNumber === n ? '#fff' : '#8892B0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Innings {n}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚾ Record Ball</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Batter</label>
            <select value={form.batter_id} onChange={e => setForm({...form, batter_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }}>
              <option value="">Select batter</option>
              {battingTeamPlayers.map(p => <option key={p.player_id || p.id} value={p.player_id || p.id}>#{p.jersey_number} {p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Bowler</label>
            <select value={form.bowler_id} onChange={e => setForm({...form, bowler_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }}>
              <option value="">Select bowler</option>
              {bowlingTeamPlayers.map(p => <option key={p.player_id || p.id} value={p.player_id || p.id}>#{p.jersey_number} {p.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Runs</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2, 3, 4, 5, 6].map(r => (
              <motion.button key={r} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setForm({...form, runs: r})}
                style={{
                  width: 48, height: 48, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: form.runs === r ? (r === 4 ? '#00D2D3' : r === 6 ? '#6C5CE7' : '#6C5CE7') : 'rgba(255,255,255,0.05)',
                  color: form.runs === r ? '#fff' : '#E8E8EE', fontSize: 18, fontWeight: 700
                }}>
                {r}
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.wicket} onChange={e => setForm({...form, wicket: e.target.checked})} />
            <span style={{ color: '#FD7272', fontSize: 13, fontWeight: 600 }}>🔴 Wicket</span>
          </label>
          <select onChange={e => setForm({...form, extras: e.target.value ? { type: e.target.value, runs: 1 } : null})}
            style={{ padding: '8px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 8, color: '#E8E8EE', fontSize: 12, outline: 'none' }}>
            <option value="">No extras</option>
            <option value="wide">Wide</option>
            <option value="noball">No Ball</option>
            <option value="bye">Bye</option>
            <option value="legbye">Leg Bye</option>
          </select>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleBall} disabled={submitting}
          style={{ width: '100%', marginTop: 20, padding: '14px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {submitting ? 'Recording...' : 'Record Ball'}
        </motion.button>
      </div>

      {currentInnings?.batting && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Batting</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(108,92,231,0.2)' }}>
                  {['Batter', 'R', 'B', '4s', '6s', 'SR'].map(h => (
                    <th key={h} style={{ color: '#8892B0', fontSize: 11, fontWeight: 600, padding: '8px 12px', textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentInnings.batting.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(108,92,231,0.08)' }}>
                    <td style={{ color: '#E8E8EE', fontSize: 13, padding: '10px 12px', fontWeight: 600 }}>{b.name}</td>
                    <td style={{ color: '#E8E8EE', fontSize: 13, padding: '10px 12px', fontWeight: 700 }}>{b.runs}</td>
                    <td style={{ color: '#8892B0', fontSize: 13, padding: '10px 12px' }}>{b.balls}</td>
                    <td style={{ color: '#00D2D3', fontSize: 13, padding: '10px 12px' }}>{b.fours}</td>
                    <td style={{ color: '#6C5CE7', fontSize: 13, padding: '10px 12px' }}>{b.sixes}</td>
                    <td style={{ color: '#8892B0', fontSize: 13, padding: '10px 12px' }}>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentInnings?.bowling && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Bowling</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(108,92,231,0.2)' }}>
                {['Bowler', 'O', 'R', 'W', 'Econ'].map(h => (
                  <th key={h} style={{ color: '#8892B0', fontSize: 11, fontWeight: 600, padding: '8px 12px', textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentInnings.bowling.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(108,92,231,0.08)' }}>
                  <td style={{ color: '#E8E8EE', fontSize: 13, padding: '10px 12px', fontWeight: 600 }}>{b.name}</td>
                  <td style={{ color: '#8892B0', fontSize: 13, padding: '10px 12px' }}>{Math.floor(b.balls / 6)}.{b.balls % 6}</td>
                  <td style={{ color: '#E8E8EE', fontSize: 13, padding: '10px 12px' }}>{b.runs}</td>
                  <td style={{ color: '#FD7272', fontSize: 13, padding: '10px 12px', fontWeight: 700 }}>{b.wickets}</td>
                  <td style={{ color: '#8892B0', fontSize: 13, padding: '10px 12px' }}>{b.balls > 0 ? ((b.runs / (b.balls / 6))).toFixed(1) : '0.0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <motion.button whileHover={{ scale: 1.02 }} onClick={completeMatch}
        style={{ width: '100%', padding: '14px', background: 'rgba(253,114,114,0.15)', border: '1px solid rgba(253,114,114,0.3)', borderRadius: 12, color: '#FD7272', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        🏁 End Match
      </motion.button>
    </div>
  );
};

export default CricketScoring;