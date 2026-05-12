import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const eventIcons = { goal: '⚽', yellow_card: '🟨', red_card: '🟥', substitution: '🔄' };

const FootballScoring = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ event_type: 'goal', player_id: '', assister_id: '', minute: '', team_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data.data);
      setEvents(res.data.data.events || []);
    } catch (err) { toast.error('Failed to load match'); }
    setLoading(false);
  };

  useEffect(() => { fetchMatch(); }, [matchId]);

  const handleEvent = async () => {
    if (!form.player_id || !form.minute || !form.team_id) { toast.error('Fill all required fields'); return; }
    setSubmitting(true);
    try {
      await api.post(`/matches/${matchId}/football/event`, form);
      toast.success('Event recorded!');
      setForm({ event_type: 'goal', player_id: '', assister_id: '', minute: '', team_id: '' });
      fetchMatch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setSubmitting(false);
  };

  const completeMatch = async () => {
    try {
      const t1Goals = events.filter(e => e.event_type === 'goal' && e.team_id === match.team1_id).length;
      const t2Goals = events.filter(e => e.event_type === 'goal' && e.team_id === match.team2_id).length;
      const summary = `${match.team1_name} ${t1Goals} - ${t2Goals} ${match.team2_name}`;
      await api.put(`/matches/${matchId}/status`, { status: 'completed', result_summary: summary });
      toast.success('Match completed!');
      navigate(`/match/${matchId}`);
    } catch (err) { toast.error('Failed'); }
  };

  const cardStyle = { background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };

  if (loading) return <LoadingSpinner />;
  if (!match) return <div style={{ color: '#E8E8EE' }}>Match not found</div>;

  const t1Goals = events.filter(e => e.event_type === 'goal' && e.team_id === match.team1_id).length;
  const t2Goals = events.filter(e => e.event_type === 'goal' && e.team_id === match.team2_id).length;
  const team1Players = match.players?.filter(p => p.team_id === match.team1_id) || [];
  const team2Players = match.players?.filter(p => p.team_id === match.team2_id) || [];
  const allPlayers = form.team_id == match.team1_id ? team1Players : form.team_id == match.team2_id ? team2Players : [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/match-history')} style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>← Back</button>

      <div style={{ ...cardStyle, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
          <div>
            <h3 style={{ color: '#E8E8EE', fontSize: 20, fontWeight: 700 }}>{match.team1_name}</h3>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#6C5CE7' }}>{t1Goals}</div>
          </div>
          <span style={{ color: '#8892B0', fontSize: 20, fontWeight: 800 }}>—</span>
          <div>
            <h3 style={{ color: '#E8E8EE', fontSize: 20, fontWeight: 700 }}>{match.team2_name}</h3>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#00D2D3' }}>{t2Goals}</div>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📝 Record Event</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Event Type</label>
            <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }}>
              <option value="goal">⚽ Goal</option>
              <option value="yellow_card">🟨 Yellow Card</option>
              <option value="red_card">🟥 Red Card</option>
              <option value="substitution">🔄 Substitution</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Team</label>
            <select value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value, player_id: '', assister_id: ''})} style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }}>
              <option value="">Select team</option>
              <option value={match.team1_id}>{match.team1_name}</option>
              <option value={match.team2_id}>{match.team2_name}</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Player</label>
            <select value={form.player_id} onChange={e => setForm({...form, player_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }}>
              <option value="">Select player</option>
              {allPlayers.map(p => <option key={p.player_id || p.id} value={p.player_id || p.id}>#{p.jersey_number} {p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Minute</label>
            <input type="number" min="0" max="120" value={form.minute} onChange={e => setForm({...form, minute: e.target.value})} placeholder="e.g. 45" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }} />
          </div>
          {form.event_type === 'goal' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Assist (optional)</label>
              <select value={form.assister_id} onChange={e => setForm({...form, assister_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10, color: '#E8E8EE', fontSize: 13, outline: 'none' }}>
                <option value="">No assist</option>
                {allPlayers.filter(p => (p.player_id || p.id) != form.player_id).map(p => <option key={p.player_id || p.id} value={p.player_id || p.id}>#{p.jersey_number} {p.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} onClick={handleEvent} disabled={submitting}
          style={{ width: '100%', marginTop: 16, padding: '14px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {submitting ? 'Recording...' : 'Record Event'}
        </motion.button>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Match Timeline</h3>
        {events.length === 0 ? (
          <p style={{ color: '#8892B0', fontSize: 13, textAlign: 'center', padding: 20 }}>No events recorded yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map((e, i) => (
              <motion.div key={e.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,92,231,0.08)' }}>
                <span style={{ fontSize: 20 }}>{eventIcons[e.event_type]}</span>
                <span style={{ color: '#6C5CE7', fontSize: 13, fontWeight: 700, minWidth: 40 }}>{e.minute}'</span>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600 }}>{e.player_name}</span>
                  {e.assister_name && <span style={{ color: '#8892B0', fontSize: 12 }}> (assist: {e.assister_name})</span>}
                </div>
                <span style={{ color: '#8892B0', fontSize: 11 }}>{e.team_name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.button whileHover={{ scale: 1.02 }} onClick={completeMatch}
        style={{ width: '100%', padding: '14px', background: 'rgba(253,114,114,0.15)', border: '1px solid rgba(253,114,114,0.3)', borderRadius: 12, color: '#FD7272', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        🏁 End Match
      </motion.button>
    </div>
  );
};

export default FootballScoring;