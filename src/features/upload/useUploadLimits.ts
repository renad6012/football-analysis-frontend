import { useEffect, useState } from "react";
import { api } from "../../api";
import { ApiError } from "../../api/errors";
import type { UploadLimits } from "../../types/api";

export function useUploadLimits() {
  const [limits, setLimits] = useState<UploadLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    api
      .getUploadLimits()
      .then((result) => {
        if (!cancelled) setLimits(result);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Could not load upload settings.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((a) => a + 1);
  };

  return { limits, loading, error, retry };
}