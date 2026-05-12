import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        if (password !== confirmPassword) { toast.error('Passwords do not match'); setLoading(false); return; }
        await signup(email, password, confirmPassword);
        toast.success('Account created!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#E8E8EE',
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0F0E17' }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,210,211,0.1))',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', zIndex: 1, padding: 40 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <h1 style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>
              ArenaX
            </h1>
            <p style={{ color: '#8892B0', fontSize: 18, maxWidth: 360, lineHeight: 1.6 }}>
              Premium tournament management for Cricket & Football
            </p>
          </motion.div>
        </div>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(108,92,231,0.08)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,210,211,0.06)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{
            width: '100%', maxWidth: 420, padding: 40,
            background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)',
            borderRadius: 20, border: '1px solid rgba(108,92,231,0.2)'
          }}>
          <h2 style={{ color: '#E8E8EE', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#8892B0', fontSize: 14, marginBottom: 32 }}>
            {isSignup ? 'Join ArenaX today' : 'Sign in to your account'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="demo@arenax.com" required style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {isSignup && (
              <div>
                <label style={{ color: '#8892B0', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: 12, cursor: 'pointer',
                background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)',
                color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 8,
                opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ color: '#8892B0', fontSize: 13 }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button onClick={() => setIsSignup(!isSignup)} style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {!isSignup && (
            <div style={{ marginTop: 24, padding: 16, background: 'rgba(108,92,231,0.1)', borderRadius: 12, border: '1px solid rgba(108,92,231,0.2)' }}>
              <p style={{ color: '#8892B0', fontSize: 12, textAlign: 'center' }}>
                Demo: <strong style={{ color: '#E8E8EE' }}>demo@arenax.com</strong> / <strong style={{ color: '#E8E8EE' }}>Demo@123</strong>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;