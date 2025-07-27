import { useState, useEffect } from 'react';
import { User } from '../App';

const API_URL = import.meta.env.VITE_API_URL;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');
  
  // Set token in localStorage
  const setToken = (token: string) => localStorage.setItem('token', token);
  
  // Remove token from localStorage
  const removeToken = () => localStorage.removeItem('token');

  // Check for token in URL (after OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setToken(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in (cookie)
    const token = getToken();
    fetch(`${API_URL}/me`, { 
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
      });
  }, []);

  const googleSignIn = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    removeToken();
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return { user, googleSignIn, logout };
}