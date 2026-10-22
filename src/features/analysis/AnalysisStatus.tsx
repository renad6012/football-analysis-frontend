import { Link } from "react-router-dom";
import type { AnalysisJob, JobStatus } from "../../types/api";
import type { FlowError } from "../upload/useUploadFlow";

const STEPS: { key: JobStatus; label: string }[] = [
  { key: "queued", label: "Queued" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
];

const TITLES: Record<JobStatus, string> = {
  queued: "Waiting in queue…",
  processing: "Analyzing the match…",
  completed: "Analysis complete",
  failed: "Analysis failed",
};

interface Props {
  job: AnalysisJob | null;
  error: FlowError | null;
  reconnecting: boolean;
  onRetry: () => void;
}

export default function AnalysisStatus({ job, error, reconnecting, onRetry }: Props) {
  if (error) {
    const canRetry = error.code !== "unauthorized" && error.code !== "not_found";
    return (
      <div className="card">
        <div className="alert" role="alert">
          <p>{error.message}</p>
          <div className="actions">
            {canRetry && <button onClick={onRetry}>Try again</button>}
            <Link className="btn-link" to="/">
              New analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card">
        <p className="muted">Checking analysis status…</p>
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="card">
        <div className="alert" role="alert">
          <p>{job.errorMessage ?? "The analysis could not be completed."}</p>
          <div className="actions">
            <Link className="btn-link" to="/">
              Start a new analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === job.status);
  const hasPercent = job.status === "processing" && typeof job.progress === "number";
  const percent = job.status === "completed" ? 100 : (job.progress ?? 0);

  return (
    <div className="card" aria-live="polite">
      <ol className="steps">
        {STEPS.map((step, i) => (
          <li
            key={step.key}
            className={i < currentIndex || job.status === "completed" ? "done" : i === currentIndex ? "active" : ""}
          >
            {step.label}
          </li>
        ))}
      </ol>

      <p className="progress-title">{TITLES[job.status]}</p>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={hasPercent || job.status === "completed" ? percent : undefined}
      >
        {hasPercent || job.status === "completed" ? (
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        ) : (
          <div className="progress-fill indeterminate" />
        )}
      </div>

      {hasPercent && <p className="muted">{percent}%</p>}
      {reconnecting && <p className="reconnecting">Connection issue. Reconnecting…</p>}
      <p className="muted small">Job ID: {job.jobId}</p>
    </div>
  );
}