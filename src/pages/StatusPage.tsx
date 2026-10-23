import { Navigate, useParams } from "react-router-dom";
import ResultsPage from "./ResultsPage";
import AnalysisStatus from "../features/analysis/AnalysisStatus";
import { useJobStatus } from "../features/analysis/useJobStatus";
import { isMockMode } from "../api";

function StatusView({ jobId }: { jobId: string }) {
  const { job, error, reconnecting, retry } = useJobStatus(jobId);

  if (job?.status === "completed") return <ResultsPage analysisId={jobId} />;

  return (
    <main className="page wide">
      <header className="page-header">
        <h1>Match Analysis</h1>
        {isMockMode && <span className="badge">Demo data · mock API</span>}
      </header>
      <AnalysisStatus job={job} error={error} reconnecting={reconnecting} onRetry={retry} />
    </main>
  );
}

export default function StatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  if (!jobId) return <Navigate to="/" replace />;
  return <StatusView key={jobId} jobId={jobId} />;
}
