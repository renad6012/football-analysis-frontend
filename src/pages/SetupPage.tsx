import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoPicker from "../features/upload/VideoPicker";
import UploadProgress from "../features/upload/UploadProgress";
import { useUploadFlow } from "../features/upload/useUploadFlow";
import { useUploadLimits } from "../features/upload/useUploadLimits";
import { isMockMode } from "../api";

export default function SetupPage() {
  const navigate = useNavigate();
  const { limits, loading, error: limitsError, retry: retryLimits } = useUploadLimits();
  const flow = useUploadFlow();
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  useEffect(() => {
    if (flow.phase === "done" && flow.jobId) {
      navigate(`/analysis/${flow.jobId}`);
    }
  }, [flow.phase, flow.jobId, navigate]);

  const handleSubmit = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    flow.submit(file);
  };

  const showForm = flow.phase === "idle";

  return (
    <main className="page">
      <header className="page-header">
        <h1>New Match Analysis</h1>
        {isMockMode && <span className="badge">Demo data · mock API</span>}
      </header>

      {showForm && loading && <p className="muted">Loading upload settings…</p>}

      {showForm && limitsError && (
        <div className="alert" role="alert">
          <p>{limitsError}</p>
          <button onClick={retryLimits}>Try again</button>
        </div>
      )}

      {showForm && limits && (
        <VideoPicker limits={limits} onSubmit={handleSubmit} />
      )}

      {!showForm && (
        <UploadProgress
          phase={flow.phase}
          progress={flow.progress}
          fileName={fileName}
          fileSize={fileSize}
          stats={flow.stats}
          error={flow.error}
          onRetry={flow.retry}
          onBack={flow.reset}
        />
      )}
    </main>
  );
}
