import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('arenax_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('arenax_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.error) throw new Error(res.data.error);
    localStorage.setItem('arenax_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (email, password, confirmPassword) => {
    const res = await api.post('/auth/signup', { email, password, confirmPassword });
    if (res.data.error) throw new Error(res.data.error);
    localStorage.setItem('arenax_token', res.data.data.token);
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('arenax_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);