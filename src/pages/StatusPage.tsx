import { Link, Navigate, useParams } from "react-router-dom";
import AnalysisStatus from "../features/analysis/AnalysisStatus";
import ResultDashboard from "../features/analysis/ResultDashboard";
import { useJobStatus } from "../features/analysis/useJobStatus";
import { isMockMode } from "../api";

function StatusView({ jobId }: { jobId: string }) {
  const { job, error, reconnecting, retry } = useJobStatus(jobId);

  return (
    <main className="page wide">
      <header className="page-header">
        <h1>Match Analysis</h1>
        {isMockMode && <span className="badge">Demo data · mock API</span>}
      </header>

      <AnalysisStatus job={job} error={error} reconnecting={reconnecting} onRetry={retry} />

      {job?.status === "completed" && (
        <section className="result">
          <h2>Analysis results</h2>
          {job.result == null ? (
            <div className="card">
              <p className="muted">The analysis finished but returned no result data.</p>
            </div>
          ) : (
            <ResultDashboard result={job.result} />
          )}
          <Link className="btn-link" to="/">
            Analyze another match
          </Link>
        </section>
      )}
    </main>
  );
}

export default function StatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  if (!jobId) return <Navigate to="/" replace />;
  return <StatusView key={jobId} jobId={jobId} />;
}