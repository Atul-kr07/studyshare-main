import { useState, useEffect } from 'react';
import { Resource } from '../App'; // Consider moving Resource type to a separate types file

const API_URL = import.meta.env.VITE_API_URL;

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources from backend
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/resources`, { 
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch resources: ${res.status}`);
      }
      const data = await res.json();
      if (data.resources) {
        setResources(data.resources);
      } else {
        setResources([]);
      }
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Unknown error');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload a new resource
  const uploadResource = async (resourceData: Omit<Resource, 'id'>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(resourceData)
      });
      if (res.ok) {
        // Re-fetch resources after upload
        const token = localStorage.getItem('token');
        const updated = await fetch(`${API_URL}/resources`, { 
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
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

  // Optional: Implement search functionality
  const searchResources = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/resources?search=${encodeURIComponent(query)}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to search resources: ${res.status}`);
      }
      const data = await res.json();
      if (data.resources) {
        setResources(data.resources);
      } else {
        setResources([]);
      }
    } catch (err: any) {
      console.error('Error searching resources:', err);
      setError(err.message || 'Unknown error');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  return { resources, loading, error, uploadResource, searchResources, fetchResources };
}