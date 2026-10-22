import { Navigate, Route, Routes } from "react-router-dom";
import SetupPage from "./pages/SetupPage";
import StatusPage from "./pages/StatusPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
      <Route path="/analysis/:jobId" element={<StatusPage />} />
      <Route path="/analysis/:jobId/results" element={<ResultsPage />} />
      <Route path="/results/:resultId" element={<ResultsPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
