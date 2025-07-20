import { useState, useEffect } from 'react';
import { Resource } from '../App';

const API_URL = 'http://localhost:4000/api';

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${API_URL}/resources`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.resources) {
          setResources(data.resources);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchResources();
  }, []);

  const uploadResource = async (resourceData: Omit<Resource, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(resourceData)
      });
      if (res.ok) {
        // Re-fetch resources after upload
        const updated = await fetch(`${API_URL}/resources`, { credentials: 'include' });
        const data = await updated.json();
        if (updated.ok && data.resources) {
          setResources(data.resources);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Optionally implement searchResources if needed
  const searchResources = () => {};

  return { resources, uploadResource, searchResources };
}