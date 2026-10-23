import { useEffect, useRef, useState } from "react";
import { api } from "../../api";
import type { JerseyPlayer } from "../../types/result";
import ResultDashboard from "./ResultDashboard";

interface Props {
  analysisId: string;
  player: JerseyPlayer;
  cachedReport: unknown;
  onCacheReport: (report: unknown) => void;
  onClose: () => void;
}

export default function PlayerDetailsDialog({ analysisId, player, cachedReport, onCacheReport, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageRetry, setImageRetry] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [requested, setRequested] = useState(false);
  const [retry, setRetry] = useState(0);
  const [report, setReport] = useState<unknown>(cachedReport);
  const [reportError, setReportError] = useState<string | null>(null);
  const imageUrl = api.getPlayerHeatmapUrl(analysisId, player.team as number, player.number as number);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  useEffect(() => {
    if (!requested || report !== undefined) return;
    let current = true;
    api.getPlayerReport(analysisId, player.team as number, player.number as number)
      .then((value) => { if (current) { setReport(value); onCacheReport(value); } })
      .catch(() => { if (current) setReportError("Could not generate the AI report. Please try again."); });
    return () => { current = false; };
  }, [analysisId, onCacheReport, player.number, player.team, report, requested, retry]);

  const close = () => { dialogRef.current?.close(); onClose(); };
  const name = player.name || "Unknown";
  return <dialog ref={dialogRef} className="player-dialog" aria-labelledby="player-dialog-title"
    onCancel={(event) => { event.preventDefault(); close(); }}
    onClick={(event) => { if (event.target === dialogRef.current) close(); }}>
    <div className="dialog-header"><div><p className="eyebrow">Team {String(player.team)} · #{String(player.number)}</p><h2 id="player-dialog-title">{name}</h2></div><button type="button" aria-label="Close player details" onClick={close}>×</button></div>
    <section className="player-detail-section"><h3>Player heatmap</h3><div className="heatmap-frame">
      {!imageLoaded && !imageError && <div className="heatmap-skeleton" aria-label="Loading heatmap" />}
      {imageError ? <div className="heatmap-error" role="alert"><p>Heatmap isn't available for this player.</p><button type="button" onClick={() => { setImageError(false); setImageLoaded(false); setImageRetry((value) => value + 1); }}>Retry</button></div> : <img key={imageRetry} src={imageUrl} alt={`Movement heatmap for ${name}, Team ${player.team}, number ${player.number}`} onLoad={() => setImageLoaded(true)} onError={() => { setImageLoaded(false); setImageError(true); }} />}
    </div></section>
    <section className="player-detail-section"><h3>AI report</h3>
      {report === undefined && !requested && <button type="button" className="primary" onClick={() => setRequested(true)}>Generate AI report</button>}
      {requested && report === undefined && !reportError && <p className="muted" aria-live="polite">Generating report…</p>}
      {reportError && <div className="alert" role="alert"><p>{reportError}</p><button type="button" onClick={() => { setReportError(null); setRetry((value) => value + 1); }}>Retry</button></div>}
      {report !== undefined && <ResultDashboard result={report} />}
    </section>
    <dl className="player-metadata">{player.role !== undefined && <div><dt>Role</dt><dd><ResultDashboard result={player.role} /></dd></div>}{player.tracked_moments !== undefined && <div><dt>Tracked moments</dt><dd><ResultDashboard result={player.tracked_moments} /></dd></div>}{typeof player.confidence === "number" && player.confidence >= 0 && player.confidence <= 1 && <div><dt>Confidence</dt><dd>{`${Math.round(player.confidence * 100)}%`}</dd></div>}</dl>
  </dialog>;
}
