import { Link, Navigate, useParams } from "react-router-dom";
import AnalysisStatus from "../features/analysis/AnalysisStatus";
import { useJobStatus } from "../features/analysis/useJobStatus";
import { isMockMode } from "../api";

function StatusView({ jobId }: { jobId: string }) {
  const { job, error, reconnecting, retry } = useJobStatus(jobId);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Match Analysis</h1>
        {isMockMode && <span className="badge">Demo data · mock API</span>}
      </header>

      <AnalysisStatus job={job} error={error} reconnecting={reconnecting} onRetry={retry} />

      {/* Button to navigate to Results dashboard while queued or waiting */}
      {job && job.status !== "completed" && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p className="muted small" style={{ marginBottom: "12px", lineHeight: "1.5" }}>
            حالة الطلب لدى السيرفر معلقة (PENDING) بانتظار اكتمال معالجة نموذج الذكاء الاصطناعي. يمكنك الانتقال مباشرة لعرض لوحة النتائج والإحصائيات:
          </p>
          <Link
            className="btn-link"
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "#06210f",
              fontWeight: 700,
              textDecoration: "none",
              padding: "10px 20px",
            }}
            to={`/results/${job.jobId}`}
          >
            عرض لوحة النتائج والإحصائيات (View Results)
          </Link>
        </div>
      )}

      {job?.status === "completed" && (
        <div className="card result">
          <h2>Analysis result</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
            <Link
              className="btn-link"
              style={{ background: "var(--accent)", color: "#06210f", fontWeight: 700 }}
              to={`/results/${job.resultId ?? job.jobId}`}
            >
              عرض نتائج تحليل المباراة (View Results)
            </Link>
            <Link className="btn-link" to="/">
              Analyze another match
            </Link>
          </div>
          <pre>{JSON.stringify(job.result, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

export default function StatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  if (!jobId) return <Navigate to="/" replace />;
  return <StatusView key={jobId} jobId={jobId} />;
}
