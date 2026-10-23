import { formatBytes } from "./validateVideo";
import type { FlowError, UploadPhase } from "./useUploadFlow";

interface Props {
  phase: UploadPhase;
  progress: number;
  fileName: string;
  fileSize: number;
  stats: { speedBps: number; etaSeconds: number } | null;
  error: FlowError | null;
  onRetry: () => void;
  onBack: () => void;
}

const STEPS: { key: UploadPhase; label: string }[] = [
  { key: "preparing", label: "Prepare" },
  { key: "uploading", label: "Upload" },
  { key: "confirming", label: "Confirm" },
];

const TITLES: Partial<Record<UploadPhase, string>> = {
  preparing: "Preparing upload…",
  uploading: "Uploading video…",
  confirming: "Confirming upload…",
  done: "Upload complete. Opening analysis…",
};

const formatEta = (s: number) => (s < 60 ? `${Math.round(s)} s` : `${Math.ceil(s / 60)} min`);

export default function UploadProgress({
  phase,
  progress,
  fileName,
  fileSize,
  stats,
  error,
  onRetry,
  onBack,
}: Props) {
  if (phase === "error" && error) {
    return (
      <div className="card">
        <div className="alert" role="alert">
          <p>{error.message}</p>
          <div className="actions">
            <button onClick={onRetry}>Try again</button>
            <button onClick={onBack}>Back to form</button>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = phase === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="card" aria-live="polite">
      <ol className="steps">
        {STEPS.map((step, i) => (
          <li
            key={step.key}
            className={i < currentIndex ? "done" : i === currentIndex ? "active" : ""}
          >
            {step.label}
          </li>
        ))}
      </ol>

      <p className="progress-title">{TITLES[phase]}</p>
      <p className="muted">{fileName}</p>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="muted">{progress}%</p>

      {phase === "uploading" && (
        <p className="muted small">
          {formatBytes((progress / 100) * fileSize)} of {formatBytes(fileSize)}
          {stats &&
            ` · ${formatBytes(stats.speedBps)}/s · about ${formatEta(stats.etaSeconds)} left`}
        </p>
      )}
    </div>
  );
}
