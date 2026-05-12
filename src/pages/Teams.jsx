import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', team_color: '#6C5CE7' });
  const [logo, setLogo] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.data || []);
    } catch (err) { toast.error('Failed to load teams'); }
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Team name is required'); return; }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('team_color', form.team_color);
      if (logo) formData.append('logo', logo);
      await api.post('/teams', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Team created!');
      setShowCreate(false);
      setForm({ name: '', description: '', team_color: '#6C5CE7' });
      setLogo(null);
      fetchTeams();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create team'); }
    setCreating(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#E8E8EE',
    fontSize: 14, outline: 'none'
  };

  const cardStyle = {
    background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)',
    borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)',
    padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer'
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ color: '#E8E8EE', fontSize: 28, fontWeight: 800 }}>Teams</h1>
          <p style={{ color: '#8892B0', fontSize: 14, marginTop: 4 }}>{teams.length} teams registered</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + Create Team
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ ...cardStyle, marginBottom: 24, cursor: 'default' }}>
            <h3 style={{ color: '#E8E8EE', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Create New Team</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Team Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} maxLength={50} placeholder="Enter team name" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Team description" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Team Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.team_color} onChange={e => setForm({...form, team_color: e.target.value})} style={{ width: 48, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
                  <span style={{ color: '#8892B0', fontSize: 13 }}>{form.team_color}</span>
                </div>
              </div>
              <div>
                <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Logo</label>
                <input type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} style={{ ...inputStyle, padding: '10px 16px' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#8892B0', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} type="submit" disabled={creating}
                  style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  {creating ? 'Creating...' : 'Create Team'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {teams.map((team, i) => (
          <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
            onClick={() => navigate(`/teams/${team.id}`)} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${team.team_color || '#6C5CE7'}, ${team.team_color || '#6C5CE7'}88)`,
                fontSize: 20, fontWeight: 800, color: '#fff'
              }}>
                {team.logo_path ?
                  <img src={`http://localhost:5001${team.logo_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> :
                  team.name?.charAt(0).toUpperCase()
                }
              </div>
              <div>
                <h3 style={{ color: '#E8E8EE', fontSize: 16, fontWeight: 700 }}>{team.name}</h3>
                <p style={{ color: '#8892B0', fontSize: 12, marginTop: 2 }}>{team.player_count || 0} players</p>
              </div>
            </div>
            {team.description && <p style={{ color: '#8892B0', fontSize: 13, lineHeight: 1.5 }}>{team.description}</p>}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: team.team_color || '#6C5CE7' }} />
              <span style={{ color: '#8892B0', fontSize: 11 }}>{team.team_color}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: '#8892B0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ color: '#E8E8EE', fontSize: 20, marginBottom: 8 }}>No teams yet</h3>
          <p>Create your first team to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Teams;