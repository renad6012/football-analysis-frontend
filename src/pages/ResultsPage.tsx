import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isMockMode } from "../api";
import { useJobStatus } from "../features/analysis/useJobStatus";
import AnalysisStatus from "../features/analysis/AnalysisStatus";
import ResultDashboard from "../features/analysis/ResultDashboard";
import PlayerDetailsDialog from "../features/analysis/PlayerDetailsDialog";
import { parseEvents, parseJerseyMap, parseResultHeader, parseStats, type JerseyPlayer } from "../types/result";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const getObject = (value: unknown, key: string): unknown => isRecord(value) ? value[key] : undefined;

function ResultsView({ analysisId }: { analysisId: string }) {
  const { job, error, reconnecting, retry } = useJobStatus(analysisId);
  const [player, setPlayer] = useState<JerseyPlayer | null>(null);
  const [reports, setReports] = useState<Record<string, unknown>>({});
  const raw = job?.result;
  const result = isRecord(raw) ? raw : null;
  const header = parseResultHeader(raw);
  const stats = parseStats(getObject(raw, "stats"));
  const events = parseEvents(getObject(raw, "events"));
  const tables = getObject(raw, "tables");
  const squad = parseJerseyMap(getObject(tables, "jersey_map"));
  const remaining = useMemo(() => {
    if (!result) return null;
    const rest = { ...result };
    delete rest.title; delete rest.score; delete rest.stats; delete rest.events;
    if (isRecord(rest.tables)) {
      const otherTables = { ...rest.tables };
      if (Object.keys(otherTables).length) rest.tables = otherTables;
    }
    return rest;
  }, [result]);

  if (job?.status === "failed") return <main className="page wide"><AnalysisStatus job={job} error={error} reconnecting={reconnecting} onRetry={retry} /></main>;
  if (job?.status !== "completed") return <main className="page wide"><header className="page-header"><h1>Match analysis</h1>{isMockMode && <span className="badge">Demo data</span>}</header><AnalysisStatus job={job} error={error} reconnecting={reconnecting} onRetry={retry} /></main>;
  if (raw === null || raw === undefined) return <main className="page wide"><h1>Match analysis</h1><p role="alert">The analysis finished but returned no result data.</p><Link to="/">Start a new analysis</Link></main>;

  const groups = squad.success ? [0, 1].map((team) => squad.data.filter((item) => item.team === team).sort((a, b) => (typeof a.number === "number" ? a.number : Infinity) - (typeof b.number === "number" ? b.number : Infinity))) : [[], []];
  const unassigned = squad.success ? squad.data.filter((item) => typeof item.team !== "number" || typeof item.number !== "number" || (item.team !== 0 && item.team !== 1)) : [];
  const cacheKey = (item: JerseyPlayer) => `${item.team}:${item.number}`;
  return <main className="page wide analytics-page">
    <header className="analytics-header"><div><p className="eyebrow">Football analysis</p><h1>{header.success && typeof header.data.title === "string" && header.data.title.length > 0 ? header.data.title : "Match analysis"}</h1>{header.success && (typeof header.data.score === "string" && header.data.score.length > 0 || typeof header.data.score === "number") && <p className="score-value">{String(header.data.score)}</p>}</div>{isMockMode && <span className="badge">Demo data</span>}</header>
    <div className="analytics-grid">
      <section className="dash-card squad-section"><h2>Squad</h2>
        {squad.success && squad.data.length > 0 ? <div className="team-grid">{groups.map((teamPlayers, team) => <section className="team-column" key={team}><h3>Team {team}</h3><div className="player-grid">{teamPlayers.map((item, index) => {
          const valid = typeof item.team === "number" && typeof item.number === "number";
          const content = <><span className="player-number">{typeof item.number === "number" ? item.number : "—"}</span><span className={item.name === "Unknown" ? "unknown-name" : "player-name"}>{item.name ?? "Unknown"}</span></>;
          return valid ? <button type="button" className="player-card" key={`${item.team}-${item.number}-${index}`} onClick={() => setPlayer(item)}>{content}</button> : <div className="player-card non-interactive" key={`invalid-${index}`}>{content}</div>;
        })}</div></section>)}{unassigned.length > 0 && <section className="team-column"><h3>Other entries</h3><div className="player-grid">{unassigned.map((item, index) => <div className="player-card non-interactive" key={`other-${index}`}><span className="player-number">{typeof item.number === "number" ? item.number : "—"}</span><span className={item.name === "Unknown" ? "unknown-name" : "player-name"}>{item.name ?? "Unknown"}</span></div>)}</div></section>}</div> : <p className="muted">No players identified.</p>}
      </section>
      <section className="dash-card"><h2>Match statistics</h2>{stats.success ? <ResultDashboard result={stats.data} /> : <ResultDashboard result={getObject(raw, "stats")} />}</section>
      <section className="dash-card"><h2>Key events</h2>{events.success ? <ResultDashboard result={events.data} /> : <ResultDashboard result={getObject(raw, "events")} />}</section>
    </div>
    {remaining && Object.keys(remaining).length > 0 && <section className="dash-card all-results"><h2>Additional analysis</h2><ResultDashboard result={remaining} /></section>}
    {!result && <section className="dash-card all-results"><h2>Analysis result</h2><ResultDashboard result={raw} /></section>}
    {header.success && header.data.title !== undefined && (typeof header.data.title !== "string" || header.data.title.length === 0) && <section className="dash-card"><h2>Title</h2><ResultDashboard result={header.data.title} /></section>}
    {header.success && header.data.score !== undefined && !(typeof header.data.score === "string" && header.data.score.length > 0) && typeof header.data.score !== "number" && <section className="dash-card"><h2>Score</h2><ResultDashboard result={header.data.score} /></section>}
    {squad.success && squad.data.length > 0 && <section className="dash-card all-results"><h2>Roster source data</h2><ResultDashboard result={squad.data} /></section>}
    <Link className="btn-link new-analysis" to="/">New analysis</Link>
    {player && typeof player.team === "number" && typeof player.number === "number" && <PlayerDetailsDialog analysisId={analysisId} player={player} cachedReport={reports[cacheKey(player)]} onCacheReport={(report) => setReports((current) => ({ ...current, [cacheKey(player)]: report }))} onClose={() => setPlayer(null)} />}
  </main>;
}

export default function ResultsPage({ analysisId }: { analysisId: string }) {
  return <ResultsView key={analysisId} analysisId={analysisId} />;
}
