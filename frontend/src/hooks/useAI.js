import { useState, useCallback } from 'react';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  const explain = useCallback(async ({ status, headers, body, method, url }) => {
    setLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const response = await fetch(BACKEND_URL + '/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: method || 'GET',
          url: url || '',
          status: status || 0,
          body: typeof body === 'string' ? body : JSON.stringify(body || {}),
        }),
      });
      if (!response.ok) throw new Error('AI analysis failed');
      const data = await response.json();
      setExplanation(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { explain, explanation, loading, error };
}
