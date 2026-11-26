import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('chatkita-token') || '');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('chatkita-user') || 'null'));
  const [dark, setDark] = useState(localStorage.getItem('chatkita-theme') === 'dark');

  const api = useMemo(() => axios.create({ baseURL: API_URL, headers: token ? { Authorization: `Bearer ${token}` } : {} }), [token]);
  const socket = useMemo(() => token ? io(SOCKET_URL, { auth: { token } }) : null, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('chatkita-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => () => socket?.disconnect(), [socket]);

  const login = data => {
    localStorage.setItem('chatkita-token', data.token);
    localStorage.setItem('chatkita-user', JSON.stringify(data.user));
    setToken(data.token); setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('chatkita-token'); localStorage.removeItem('chatkita-user');
    setToken(''); setUser(null);
  };

  return <AppContext.Provider value={{ api, socket, token, user, setUser, login, logout, dark, setDark }}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
