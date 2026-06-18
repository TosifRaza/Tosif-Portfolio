import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for fetching data from the backend API.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => api.getProjects());
 *
 * With dependencies (re-fetches when deps change):
 *   const { data } = useApi(() => api.getProjects(), [someDep]);
 *
 * Returns:
 *   - data: the fetched data (null while loading)
 *   - loading: boolean
 *   - error: error message string (null if no error)
 *   - refetch: () => Promise<void> — manually re-fetch
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      console.error('[useApi] error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
