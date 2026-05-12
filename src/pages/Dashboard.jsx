import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teams: 0, players: 0, upcoming: 0, completed: 0, live: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, matchesRes] = await Promise.all([
          api.get('/teams'),
          api.get('/matches')
        ]);
        const teams = teamsRes.data.data || [];
        const matches = matchesRes.data.data || [];
        const playerCount = teams.reduce((sum, t) => sum + (t.player_count || 0), 0);
        setStats({
          teams: teams.length,
          players: playerCount,
          upcoming: matches.filter(m => m.status === 'upcoming').length,
          completed: matches.filter(m => m.status === 'completed').length,
          live: matches.filter(m => m.status === 'live').length
        });
        setRecentActivity([
          ...teams.slice(0, 3).map(t => ({ action: `Team "${t.name}" created`, time: t.created_at })),
          ...matches.slice(0, 2).map(m => ({ action: `Match: ${m.team1_name} vs ${m.team2_name}`, time: m.created_at }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Teams', value: stats.teams, icon: '👥', color: '#6C5CE7' },
    { label: 'Players', value: stats.players, icon: '🏃', color: '#00D2D3' },
    { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: '#FD7272' },
    { label: 'Completed', value: stats.completed, icon: '✅', color: '#00D2D3' },
    { label: 'Live', value: stats.live, icon: '🔴', color: '#FD7272' },
  ];

  const cardStyle = {
    background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)',
    borderRadius: 16, border: '1px solid rgba(108,92,231,0.15)',
    padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#E8E8EE', fontSize: 32, fontWeight: 800 }}>
          Welcome, {user?.username || 'Player'}! 👋
        </h1>
        <p style={{ color: '#8892B0', fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} whileHover={{ y: -4, boxShadow: `0 8px 24px ${card.color}22` }}
            style={{ ...cardStyle, cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{card.icon}</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</span>
            </div>
            <span style={{ color: '#8892B0', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</span>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={cardStyle}>
          <h3 style={{ color: '#E8E8EE', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Create Team', path: '/teams', icon: '➕', color: '#6C5CE7' },
              { label: 'Create Match', path: '/matches', icon: '🏟️', color: '#00D2D3' },
            ].map(action => (
              <motion.button key={action.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                  background: `${action.color}15`, border: `1px solid ${action.color}33`,
                  borderRadius: 12, color: action.color, cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left'
                }}>
                <span style={{ fontSize: 18 }}>{action.icon}</span> {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={cardStyle}>
          <h3 style={{ color: '#E8E8EE', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🕐 Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p style={{ color: '#8892B0', fontSize: 13 }}>No recent activity yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(108,92,231,0.1)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6C5CE7', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: '#E8E8EE', fontSize: 13 }}>{item.action}</div>
                    <div style={{ color: '#8892B0', fontSize: 11, marginTop: 2 }}>{new Date(item.time).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;