import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors = { upcoming: '#00D2D3', live: '#FD7272', completed: '#6C5CE7' };

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSport, setFilterSport] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const params = {};
    if (filterStatus !== 'all') params.status = filterStatus;
    if (filterSport !== 'all') params.sport = filterSport;
    api.get('/matches', { params }).then(res => { setMatches(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [filterStatus, filterSport]);

  const cardStyle = { background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };
  const chipStyle = (active) => ({ padding: '8px 16px', borderRadius: 8, border: 'none', background: active ? '#6C5CE7' : 'rgba(255,255,255,0.05)', color: active ? '#fff' : '#8892B0', cursor: 'pointer', fontSize: 13, fontWeight: 600 });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#E8E8EE', fontSize: 28, fontWeight: 800 }}>Match History</h1>
          <p style={{ color: '#8892B0', fontSize: 14, marginTop: 4 }}>{matches.length} matches</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/matches')}
          style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + New Match
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'upcoming', 'live', 'completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={chipStyle(filterStatus === s)}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(108,92,231,0.2)', margin: '0 8px' }} />
        {['all', 'cricket', 'football'].map(s => (
          <button key={s} onClick={() => setFilterSport(s)} style={chipStyle(filterSport === s)}>{s === 'all' ? 'All Sports' : s === 'cricket' ? '🏏 Cricket' : '⚽ Football'}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {matches.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}
            onClick={() => navigate(`/match/${m.id}`)}
            style={{ ...cardStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 24 }}>{m.sport === 'cricket' ? '🏏' : '⚽'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#E8E8EE', fontSize: 15, fontWeight: 700 }}>{m.team1_name}</span>
                <span style={{ color: '#8892B0', fontSize: 13 }}>vs</span>
                <span style={{ color: '#E8E8EE', fontSize: 15, fontWeight: 700 }}>{m.team2_name}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 4, color: '#8892B0', fontSize: 12 }}>
                <span>📍 {m.venue || 'TBD'}</span>
                <span>📅 {m.match_date ? new Date(m.match_date).toLocaleDateString() : 'TBD'}</span>
              </div>
              {m.result_summary && <p style={{ color: '#00D2D3', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{m.result_summary}</p>}
            </div>
            <span style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: `${statusColors[m.status]}22`, color: statusColors[m.status], textTransform: 'capitalize'
            }}>
              {m.status === 'live' && '🔴 '}{m.status}
            </span>
          </motion.div>
        ))}
      </div>

      {matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: '#8892B0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏟️</div>
          <h3 style={{ color: '#E8E8EE', fontSize: 20, marginBottom: 8 }}>No matches found</h3>
          <p>Create your first match to get started!</p>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;