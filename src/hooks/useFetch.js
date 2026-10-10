import { useCallback, useEffect, useState } from "react";

/**
 * Minimal data-fetching hook. Runs `fn` on mount and exposes
 * { data, loading, error, refetch }. Pass a stable async function (e.g. from
 * a service) and its dependency list.
 */
export default function useFetch(fn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Caller-provided deps are serialized so `run` stays stable between renders.
  const depsKey = JSON.stringify(deps);

  const run = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depsKey],
  );

  useEffect(() => {
    if (immediate) {
      // Kick off the initial request. `run` sets `loading` to true before the
      // first await, which the hooks lint flags as a synchronous setState in an
      // effect — an accepted pattern for a small data-fetching hook.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      run().catch(() => {});
    }
  }, [run, immediate]);

  return { data, loading, error, refetch: run };
}
