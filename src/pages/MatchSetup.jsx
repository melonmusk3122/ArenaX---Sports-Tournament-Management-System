import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ sport: 'cricket', team1_id: '', team2_id: '', venue: '', match_date: '', format: 'T20' });
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);

  useEffect(() => {
    api.get('/teams').then(res => { setTeams(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.team1_id) api.get(`/teams/${form.team1_id}/players`).then(res => setTeam1Players(res.data.data || []));
    if (form.team2_id) api.get(`/teams/${form.team2_id}/players`).then(res => setTeam2Players(res.data.data || []));
  }, [form.team1_id, form.team2_id]);

  const togglePlayer = (playerId, teamNum) => {
    const [selected, setSelected] = teamNum === 1 ? [selected1, setSelected1] : [selected2, setSelected2];
    if (selected.includes(playerId)) setSelected(selected.filter(id => id !== playerId));
    else if (selected.length < 11) setSelected([...selected, playerId]);
    else toast.error('Maximum 11 players');
  };

  const handleCreate = async () => {
    if (selected1.length !== 11 || selected2.length !== 11) { toast.error('Select exactly 11 players per team'); return; }
    setCreating(true);
    try {
      const players = [
        ...selected1.map(id => ({ player_id: id, team_id: parseInt(form.team1_id) })),
        ...selected2.map(id => ({ player_id: id, team_id: parseInt(form.team2_id) }))
      ];
      const res = await api.post('/matches', { ...form, team1_id: parseInt(form.team1_id), team2_id: parseInt(form.team2_id), players });
      toast.success('Match created!');
      navigate('/match-history');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create match'); }
    setCreating(false);
  };

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#E8E8EE', fontSize: 14, outline: 'none' };
  const cardStyle = { background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };

  if (loading) return <LoadingSpinner />;

  const team1 = teams.find(t => t.id == form.team1_id);
  const team2 = teams.find(t => t.id == form.team2_id);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: '#E8E8EE', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Match</h1>
      <p style={{ color: '#8892B0', fontSize: 14, marginBottom: 32 }}>Step {step} of 3</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? 'linear-gradient(90deg, #6C5CE7, #00D2D3)' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={cardStyle}>
          <h3 style={{ color: '#E8E8EE', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Match Details</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {['cricket', 'football'].map(s => (
              <motion.button key={s} whileHover={{ scale: 1.02 }} onClick={() => setForm({...form, sport: s, format: s === 'cricket' ? 'T20' : '90min'})}
                style={{ flex: 1, padding: '16px', borderRadius: 12, border: `2px solid ${form.sport === s ? '#6C5CE7' : 'rgba(108,92,231,0.2)'}`, background: form.sport === s ? 'rgba(108,92,231,0.15)' : 'transparent', color: '#E8E8EE', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
                {s === 'cricket' ? '🏏 Cricket' : '⚽ Football'}
              </motion.button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Team 1</label>
              <select value={form.team1_id} onChange={e => setForm({...form, team1_id: e.target.value})} style={{ ...inputStyle, background: 'rgba(26,26,46,0.9)' }}>
                <option value="">Select team</option>
                {teams.filter(t => t.id != form.team2_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Team 2</label>
              <select value={form.team2_id} onChange={e => setForm({...form, team2_id: e.target.value})} style={{ ...inputStyle, background: 'rgba(26,26,46,0.9)' }}>
                <option value="">Select team</option>
                {teams.filter(t => t.id != form.team1_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Venue</label>
              <input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="Stadium name" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Date</label>
              <input type="datetime-local" value={form.match_date} onChange={e => setForm({...form, match_date: e.target.value})} style={inputStyle} />
            </div>
            {form.sport === 'cricket' && (
              <div>
                <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Format</label>
                <select value={form.format} onChange={e => setForm({...form, format: e.target.value})} style={{ ...inputStyle, background: 'rgba(26,26,46,0.9)' }}>
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <motion.button whileHover={{ scale: 1.02 }}
              onClick={() => { if (!form.team1_id || !form.team2_id) { toast.error('Select both teams'); return; } setStep(2); }}
              style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Next →
            </motion.button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[{ team: team1, players: team1Players, selected: selected1, num: 1 }, { team: team2, players: team2Players, selected: selected2, num: 2 }].map(({ team, players, selected, num }) => (
              <div key={num} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700 }}>{team?.name || 'Team'}</h3>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: selected.length === 11 ? 'rgba(0,210,211,0.2)' : 'rgba(253,114,114,0.2)',
                    color: selected.length === 11 ? '#00D2D3' : '#FD7272'
                  }}>{selected.length}/11</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                  {players.map(p => {
                    const isSelected = selected.includes(p.id);
                    return (
                      <motion.div key={p.id} whileHover={{ scale: 1.01 }}
                        onClick={() => togglePlayer(p.id, num)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                          borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                          background: isSelected ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? '#6C5CE7' : 'rgba(108,92,231,0.1)'}`
                        }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isSelected ? '#6C5CE7' : '#8892B0'}`, background: isSelected ? '#6C5CE7' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                          {isSelected && '✓'}
                        </div>
                        <span style={{ color: '#8892B0', fontSize: 12, fontWeight: 700, width: 32 }}>#{p.jersey_number}</span>
                        <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600, flex: 1 }}>{p.name}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(0,210,211,0.15)', color: '#00D2D3', fontSize: 10, fontWeight: 600 }}>{p.role}</span>
                      </motion.div>
                    );
                  })}
                  {players.length === 0 && <p style={{ color: '#8892B0', fontSize: 13, textAlign: 'center', padding: 20 }}>No players. Add players to this team first.</p>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#8892B0', cursor: 'pointer', fontSize: 13 }}>← Back</button>
            <motion.button whileHover={{ scale: 1.02 }}
              onClick={() => { if (selected1.length !== 11 || selected2.length !== 11) { toast.error('Select exactly 11 players per team'); return; } setStep(3); }}
              style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Next →
            </motion.button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={cardStyle}>
          <h3 style={{ color: '#E8E8EE', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Review & Confirm</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${team1?.team_color || '#6C5CE7'}, ${team1?.team_color || '#6C5CE7'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 24, fontWeight: 800, color: '#fff' }}>{team1?.name?.charAt(0)}</div>
              <h4 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700 }}>{team1?.name}</h4>
              <p style={{ color: '#8892B0', fontSize: 12 }}>{selected1.length} players</p>
            </div>
            <div style={{ fontSize: 24, color: '#8892B0', fontWeight: 800 }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${team2?.team_color || '#00D2D3'}, ${team2?.team_color || '#00D2D3'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 24, fontWeight: 800, color: '#fff' }}>{team2?.name?.charAt(0)}</div>
              <h4 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700 }}>{team2?.name}</h4>
              <p style={{ color: '#8892B0', fontSize: 12 }}>{selected2.length} players</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, padding: 16, background: 'rgba(108,92,231,0.08)', borderRadius: 12 }}>
            <div><span style={{ color: '#8892B0', fontSize: 12 }}>Sport:</span> <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600 }}>{form.sport === 'cricket' ? '🏏 Cricket' : '⚽ Football'}</span></div>
            <div><span style={{ color: '#8892B0', fontSize: 12 }}>Format:</span> <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600 }}>{form.format}</span></div>
            <div><span style={{ color: '#8892B0', fontSize: 12 }}>Venue:</span> <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600 }}>{form.venue || 'TBD'}</span></div>
            <div><span style={{ color: '#8892B0', fontSize: 12 }}>Date:</span> <span style={{ color: '#E8E8EE', fontSize: 13, fontWeight: 600 }}>{form.match_date ? new Date(form.match_date).toLocaleString() : 'TBD'}</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(2)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#8892B0', cursor: 'pointer', fontSize: 13 }}>← Back</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={creating}
              style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {creating ? 'Creating...' : '🏟️ Create Match'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MatchSetup;