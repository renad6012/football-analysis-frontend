import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";
import { ApiError } from "../../api/errors";
import type { AnalysisJob } from "../../types/api";
import type { FlowError } from "../upload/useUploadFlow";

const POLL_INTERVAL_MS = 2000;
const MAX_CONSECUTIVE_FAILURES = 3;
const RETRYABLE = ["network", "timeout", "server"];
const MAX_WAIT_MS = 15 * 60 * 1000;

export function useJobStatus(jobId: string) {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState<FlowError | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    const startedAt = Date.now();

    const hasExceededWait = () => Date.now() - startedAt >= MAX_WAIT_MS;

    const setTimeoutError = () => {
      setReconnecting(false);
      setError({
        code: "timeout",
        message: "Analysis is taking too long. Please try again.",
      });
    };

    const poll = async () => {
      if (cancelled) return;

      if (hasExceededWait()) {
        setTimeoutError();
        return;
      }

      try {
        const result = await api.getJobStatus(jobId);
        if (cancelled) return;

        failures = 0;
        setReconnecting(false);
        setJob(result);

        if (result.status === "queued" || result.status === "processing") {
          if (hasExceededWait()) {
            setTimeoutError();
            return;
          }

          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (cancelled) return;

        const err =
          e instanceof ApiError
            ? e
            : new ApiError("unknown", "Something went wrong. Please try again.");

        failures += 1;

        if (hasExceededWait()) {
          setTimeoutError();
          return;
        }

        // Retry temporary errors, but stop after too many consecutive failures.
        if (
          RETRYABLE.includes(err.code) &&
          failures < MAX_CONSECUTIVE_FAILURES
        ) {
          setReconnecting(true);
          timer = setTimeout(poll, POLL_INTERVAL_MS * 2);
          return;
        }

        setReconnecting(false);
        setError({ code: err.code, message: err.message });
      }
    };

    void poll();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [jobId, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return { job, error, reconnecting, retry };
}