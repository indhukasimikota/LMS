import { useState, useCallback } from 'react';

/**
 * Generic hook for async API calls.
 * Returns { data, loading, error, execute }
 */
const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFunc(...args);
        setData(res.data);
        return res.data;
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'An unexpected error occurred.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute };
};

export default useApi;
