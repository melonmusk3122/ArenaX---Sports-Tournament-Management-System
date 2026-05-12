import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const eventIcons = { goal: '⚽', yellow_card: '🟨', red_card: '🟥', substitution: '🔄' };
const statusColors = { upcoming: '#00D2D3', live: '#FD7272', completed: '#6C5CE7' };

const MatchDetail = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/matches/${matchId}`).then(res => { setMatch(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [matchId]);

  const cardStyle = { background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };

  if (loading) return <LoadingSpinner />;
  if (!match) return <div style={{ color: '#E8E8EE', textAlign: 'center', padding: 60 }}>Match not found</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/match-history')} style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>← Back to Matches</button>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(108,92,231,0.15)', color: '#6C5CE7', fontSize: 12, fontWeight: 600 }}>
            {match.sport === 'cricket' ? '🏏 Cricket' : '⚽ Football'}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 20, background: `${statusColors[match.status]}22`, color: statusColors[match.status], fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
            {match.status === 'live' ? '🔴 ' : ''}{match.status}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${match.team1_color || '#6C5CE7'}, ${match.team1_color || '#6C5CE7'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 22, fontWeight: 800, color: '#fff' }}>{match.team1_name?.charAt(0)}</div>
            <h3 style={{ color: '#E8E8EE', fontSize: 18, fontWeight: 700 }}>{match.team1_name}</h3>
          </div>
          <span style={{ color: '#8892B0', fontSize: 16, fontWeight: 800 }}>VS</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${match.team2_color || '#00D2D3'}, ${match.team2_color || '#00D2D3'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 22, fontWeight: 800, color: '#fff' }}>{match.team2_name?.charAt(0)}</div>
            <h3 style={{ color: '#E8E8EE', fontSize: 18, fontWeight: 700 }}>{match.team2_name}</h3>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, color: '#8892B0', fontSize: 13 }}>
          <span>📍 {match.venue || 'TBD'}</span>
          <span>📅 {match.match_date ? new Date(match.match_date).toLocaleDateString() : 'TBD'}</span>
        </div>

        {match.result_summary && (
          <div style={{ textAlign: 'center', marginTop: 16, padding: 12, background: 'rgba(108,92,231,0.1)', borderRadius: 12 }}>
            <span style={{ color: '#E8E8EE', fontSize: 15, fontWeight: 700 }}>{match.result_summary}</span>
          </div>
        )}
      </div>

      {match.status === 'upcoming' && (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <h3 style={{ color: '#E8E8EE', fontSize: 18, marginBottom: 8 }}>Match is upcoming</h3>
          <p style={{ color: '#8892B0', fontSize: 13 }}>Scorecard will appear once the match begins.</p>
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate(match.sport === 'cricket' ? `/cricket-scoring/${matchId}` : `/football-scoring/${matchId}`)}
            style={{ marginTop: 20, padding: '12px 32px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            🎯 Start Scoring
          </motion.button>
        </div>
      )}

      {match.sport === 'cricket' && match.innings && match.innings.length > 0 && (
        <div>
          {match.innings.map(inn => (
            <div key={inn.id} style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700 }}>Innings {inn.innings_number}</h3>
                <span style={{ color: '#6C5CE7', fontSize: 20, fontWeight: 800 }}>
                  {inn.total_runs}/{inn.total_wickets} ({Math.floor(inn.total_overs)}.{Math.round((inn.total_overs % 1) * 10)} ov)
                </span>
              </div>
              {inn.batting && inn.batting.length > 0 && (
                <>
                  <h4 style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Batting</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                    <thead><tr style={{ borderBottom: '1px solid rgba(108,92,231,0.2)' }}>
                      {['Batter', 'R', 'B', '4s', '6s', 'SR'].map(h => <th key={h} style={{ color: '#8892B0', fontSize: 11, padding: '6px 10px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{inn.batting.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(108,92,231,0.05)' }}>
                        <td style={{ color: '#E8E8EE', fontSize: 13, padding: '8px 10px', fontWeight: 600 }}>{b.name}</td>
                        <td style={{ color: '#E8E8EE', fontSize: 13, padding: '8px 10px', fontWeight: 700 }}>{b.runs}</td>
                        <td style={{ color: '#8892B0', fontSize: 13, padding: '8px 10px' }}>{b.balls}</td>
                        <td style={{ color: '#00D2D3', fontSize: 13, padding: '8px 10px' }}>{b.fours}</td>
                        <td style={{ color: '#6C5CE7', fontSize: 13, padding: '8px 10px' }}>{b.sixes}</td>
                        <td style={{ color: '#8892B0', fontSize: 13, padding: '8px 10px' }}>{b.balls ? ((b.runs/b.balls)*100).toFixed(1) : '0.0'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </>
              )}
              {inn.bowling && inn.bowling.length > 0 && (
                <>
                  <h4 style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Bowling</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: '1px solid rgba(108,92,231,0.2)' }}>
                      {['Bowler', 'O', 'R', 'W', 'Econ'].map(h => <th key={h} style={{ color: '#8892B0', fontSize: 11, padding: '6px 10px', textAlign: 'left' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{inn.bowling.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(108,92,231,0.05)' }}>
                        <td style={{ color: '#E8E8EE', fontSize: 13, padding: '8px 10px', fontWeight: 600 }}>{b.name}</td>
                        <td style={{ color: '#8892B0', fontSize: 13, padding: '8px 10px' }}>{Math.floor(b.balls/6)}.{b.balls%6}</td>
                        <td style={{ color: '#E8E8EE', fontSize: 13, padding: '8px 10px' }}>{b.runs}</td>
                        <td style={{ color: '#FD7272', fontSize: 13, padding: '8px 10px', fontWeight: 700 }}>{b.wickets}</td>
                        <td style={{ color: '#8892B0', fontSize: 13, padding: '8px 10px' }}>{b.balls ? (b.runs/(b.balls/6)).toFixed(1) : '0.0'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {match.sport === 'football' && match.events && match.events.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Match Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {match.events.map((e, i) => (
              <motion.div key={e.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 18 }}>{eventIcons[e.event_type]}</span>
                <span style={{ color: '#6C5CE7', fontSize: 13, fontWeight: 700, minWidth: 40 }}>{e.minute}'</span>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600 }}>{e.player_name}</span>
                  {e.assister_name && <span style={{ color: '#8892B0', fontSize: 12 }}> (assist: {e.assister_name})</span>}
                </div>
                <span style={{ color: '#8892B0', fontSize: 11 }}>{e.team_name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {match.status !== 'upcoming' && match.sport === 'cricket' && (!match.innings || match.innings.length === 0) && (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <p style={{ color: '#8892B0' }}>No scorecard data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;