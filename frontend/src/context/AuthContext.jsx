import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { logEvent } from '../utils/logger';
import { API_URL } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    setUser(res.data.user);
    logEvent('LOGIN', { email });
    return res.data;
  };

  const register = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password });
    logEvent('REGISTER', { email });
    return res.data;
  };

  const logout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`);
    logEvent('LOGOUT', {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
