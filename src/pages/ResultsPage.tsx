import { Link, useParams } from "react-router-dom";

export default function ResultsPage() {
  const { resultId } = useParams<{ resultId: string }>();

  return (
    <main className="page">
      <h1>Results</h1>
      <p className="muted">Result ID: {resultId}</p>
      <p>The results view will be connected here.</p>
      <Link to="/">Start a new analysis</Link>
    </main>
  );
}