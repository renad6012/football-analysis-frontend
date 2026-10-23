import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { ApiError, type ApiErrorCode } from "../../api/errors";
import { resolveContentType } from "./contentType";

export type UploadPhase =
  | "idle"
  | "preparing"
  | "uploading"
  | "confirming"
  | "done"
  | "error";

export interface FlowError {
  code: ApiErrorCode;
  message: string;
}

export interface UploadStats {
  speedBps: number;
  etaSeconds: number;
}

export function useUploadFlow() {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [error, setError] = useState<FlowError | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const submission = useRef<{ file: File } | null>(null);
  const uploadedId = useRef<string | null>(null); // set once the video is uploaded
  const confirmed = useRef(false); // set once the backend confirmed the upload
  const busy = useRef(false);

  const run = useCallback(async () => {
    const current = submission.current;
    if (!current || busy.current) return;
    busy.current = true;
    setError(null);

    try {
      let uploadId = uploadedId.current;

      if (!uploadId) {
        setPhase("preparing");
        setProgress(0);
        setStats(null);
        const permission = await api.requestUploadPermission({
          name: current.file.name,
          type: resolveContentType(current.file),
          size: current.file.size,
        });

        setPhase("uploading");
        const startedAt = Date.now();
        await api.uploadVideo(current.file, permission, (percent) => {
          setProgress(percent);
          const seconds = (Date.now() - startedAt) / 1000;
          if (seconds > 1 && percent > 0) {
            const sent = (percent / 100) * current.file.size;
            setStats({
              speedBps: sent / seconds,
              etaSeconds: (seconds * (100 - percent)) / percent,
            });
          }
        });

        uploadId = permission.uploadId;
        uploadedId.current = uploadId;
        setProgress(100);
      }

      setPhase("confirming");
      if (!confirmed.current) {
        await api.confirmUpload(uploadId);
        confirmed.current = true;
      }
      const result = await api.createAnalysis(uploadId);

      setJobId(result.jobId);
      setPhase("done");
    } catch (e) {
      const err =
        e instanceof ApiError
          ? e
          : new ApiError("unknown", "Something went wrong. Please try again.");
      setError({ code: err.code, message: err.message });
      setPhase("error");
    } finally {
      busy.current = false;
    }
  }, []);

  const submit = useCallback(
    (file: File) => {
      submission.current = { file };
      uploadedId.current = null;
      confirmed.current = false;
      setJobId(null);
      setStats(null);
      void run();
    },
    [run]
  );

  const reset = useCallback(() => {
    submission.current = null;
    uploadedId.current = null;
    confirmed.current = false;
    setPhase("idle");
    setProgress(0);
    setStats(null);
    setError(null);
  }, []);

  // Warn the user if they try to close the page during the upload
  useEffect(() => {
    if (phase !== "preparing" && phase !== "uploading") return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  return {
    phase,
    progress,
    stats,
    error,
    jobId,
    submit,
    retry: run,
    reset,
  };
}
