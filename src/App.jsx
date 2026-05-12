import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Players from './pages/Players';
import MatchSetup from './pages/MatchSetup';
import CricketScoring from './pages/CricketScoring';
import FootballScoring from './pages/FootballScoring';
import MatchDetail from './pages/MatchDetail';
import MatchHistory from './pages/MatchHistory';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const App = () => (
  <AuthProvider>
    <Toaster position="top-right" toastOptions={{
      style: { background: '#1A1A2E', color: '#E8E8EE', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12 },
      success: { iconTheme: { primary: '#00D2D3', secondary: '#fff' } },
      error: { iconTheme: { primary: '#FD7272', secondary: '#fff' } }
    }} />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/teams/:teamId" element={<ProtectedRoute><Players /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><MatchSetup /></ProtectedRoute>} />
        <Route path="/cricket-scoring/:matchId" element={<ProtectedRoute><CricketScoring /></ProtectedRoute>} />
        <Route path="/football-scoring/:matchId" element={<ProtectedRoute><FootballScoring /></ProtectedRoute>} />
        <Route path="/match/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
        <Route path="/match-history" element={<ProtectedRoute><MatchHistory /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;