import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const rolesBySport = {
  cricket: ['Batter', 'Bowler', 'All-rounder', 'Wicketkeeper'],
  football: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
};

const Players = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [sport, setSport] = useState('cricket');
  const [form, setForm] = useState({ name: '', jersey_number: '', role: '' });
  const [adding, setAdding] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get(`/teams/${teamId}`);
      const data = res.data.data;
      setTeam(data);
      setPlayers(data.players || []);
    } catch (err) { toast.error('Failed to load team'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [teamId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.jersey_number || !form.role) { toast.error('All fields required'); return; }
    setAdding(true);
    try {
      await api.post(`/teams/${teamId}/players`, form);
      toast.success('Player added!');
      setShowAdd(false);
      setForm({ name: '', jersey_number: '', role: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add player'); }
    setAdding(false);
  };

  const viewPlayerProfile = async (playerId) => {
    try {
      const res = await api.get(`/players/${playerId}`);
      setSelectedPlayer(res.data.data);
    } catch (err) { toast.error('Failed to load player'); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#E8E8EE', fontSize: 14, outline: 'none'
  };

  const cardStyle = {
    background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)',
    borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)',
    padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  };

  if (loading) return <LoadingSpinner />;
  if (!team) return <div style={{ color: '#E8E8EE' }}>Team not found</div>;

  return (
    <div>
      <button onClick={() => navigate('/teams')} style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>← Back to Teams</button>

      <div style={{ ...cardStyle, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${team.team_color}, ${team.team_color}88)`,
          fontSize: 28, fontWeight: 800, color: '#fff'
        }}>
          {team.name?.charAt(0)}
        </div>
        <div>
          <h1 style={{ color: '#E8E8EE', fontSize: 24, fontWeight: 800 }}>{team.name}</h1>
          <p style={{ color: '#8892B0', fontSize: 13 }}>{team.description} • {players.length} players</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAdd(true)} style={{ marginLeft: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Add Player
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ ...cardStyle, marginBottom: 24 }}>
            <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Player</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['cricket', 'football'].map(s => (
                <button key={s} onClick={() => { setSport(s); setForm({...form, role: ''}); }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: sport === s ? '#6C5CE7' : 'rgba(255,255,255,0.05)', color: sport === s ? '#fff' : '#8892B0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {s === 'cricket' ? '🏏 Cricket' : '⚽ Football'}
                </button>
              ))}
            </div>
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Player name" required style={inputStyle} />
              <input type="number" value={form.jersey_number} onChange={e => setForm({...form, jersey_number: e.target.value})} placeholder="Jersey #" required style={inputStyle} />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} required style={{ ...inputStyle, background: 'rgba(26,26,46,0.9)' }}>
                <option value="">Select role</option>
                {rolesBySport[sport].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#8892B0', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} type="submit" disabled={adding} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>{adding ? 'Adding...' : 'Add Player'}</motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Profile Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedPlayer(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ ...cardStyle, width: 480, maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${selectedPlayer.team_color || '#6C5CE7'}, #00D2D3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32, fontWeight: 800, color: '#fff' }}>
                  {selectedPlayer.name?.charAt(0)}
                </div>
                <h2 style={{ color: '#E8E8EE', fontSize: 24, fontWeight: 800 }}>{selectedPlayer.name}</h2>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: '#6C5CE722', color: '#6C5CE7', fontSize: 12, fontWeight: 600 }}>#{selectedPlayer.jersey_number}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: '#00D2D322', color: '#00D2D3', fontSize: 12, fontWeight: 600 }}>{selectedPlayer.role}</span>
                </div>
                <p style={{ color: '#8892B0', fontSize: 13, marginTop: 8 }}>{selectedPlayer.team_name}</p>
              </div>
              {selectedPlayer.stats && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(108,92,231,0.1)', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#6C5CE7' }}>{selectedPlayer.stats.matches_played}</div>
                    <div style={{ color: '#8892B0', fontSize: 11, marginTop: 4 }}>Matches</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(0,210,211,0.1)', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#00D2D3' }}>{selectedPlayer.stats.runs_or_goals}</div>
                    <div style={{ color: '#8892B0', fontSize: 11, marginTop: 4 }}>Runs/Goals</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(253,114,114,0.1)', borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#FD7272' }}>{selectedPlayer.stats.wickets_or_assists}</div>
                    <div style={{ color: '#8892B0', fontSize: 11, marginTop: 4 }}>Wickets/Assists</div>
                  </div>
                </div>
              )}
              <button onClick={() => setSelectedPlayer(null)} style={{ width: '100%', marginTop: 20, padding: '12px', background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#6C5CE7', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {players.map((player, i) => (
          <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
            onClick={() => viewPlayerProfile(player.id)}
            style={{ ...cardStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${team.team_color}, #00D2D3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {player.name?.charAt(0)}
            </div>
            <div>
              <h4 style={{ color: '#E8E8EE', fontSize: 15, fontWeight: 700 }}>{player.name}</h4>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span style={{ padding: '2px 8px', borderRadius: 20, background: '#6C5CE722', color: '#6C5CE7', fontSize: 11, fontWeight: 600 }}>#{player.jersey_number}</span>
                <span style={{ padding: '2px 8px', borderRadius: 20, background: '#00D2D322', color: '#00D2D3', fontSize: 11, fontWeight: 600 }}>{player.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {players.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#8892B0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
          <h3 style={{ color: '#E8E8EE', fontSize: 18, marginBottom: 8 }}>No players yet</h3>
          <p>Add players to build your roster!</p>
        </div>
      )}
    </div>
  );
};

export default Players;