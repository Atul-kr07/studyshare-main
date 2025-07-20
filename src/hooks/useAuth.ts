import { useState, useEffect } from 'react';
import { User } from '../App';

const API_URL = 'http://localhost:4000/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in (cookie)
    fetch(`${API_URL}/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
      });
  }, []);

  const googleSignIn = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return { user, googleSignIn, logout };
}