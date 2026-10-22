import type { FlowError, UploadPhase } from "./useUploadFlow";

interface Props {
  phase: UploadPhase;
  progress: number;
  fileName: string;
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

export default function UploadProgress({
  phase,
  progress,
  fileName,
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
            {error.code !== "unauthorized" && <button onClick={onRetry}>Try again</button>}
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
    </div>
  );
}