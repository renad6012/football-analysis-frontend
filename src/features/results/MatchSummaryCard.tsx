import type { MatchStatRow } from "./types";

interface Props {
  title?: string;
  homeTeam: {
    name: string;
    badgeNumber?: number | string;
  };
  awayTeam: {
    name: string;
    badgeNumber?: number | string;
  };
  scoreDisplay?: string;
  statusLabel?: string;
  statsTitle?: string;
  stats: MatchStatRow[];
}

export default function MatchSummaryCard({
  title = "ملخص المباراة",
  homeTeam,
  awayTeam,
  scoreDisplay = "—",
  statusLabel = "بيانات تجريبية",
  statsTitle = "إحصائيات الفريقين",
  stats,
}: Props) {
  return (
    <section className="card match-summary-card" aria-label={title}>
      <h2 className="card-section-title">{title}</h2>

      <div className="teams-score-board">
        {/* Team 1 (Start/Right in RTL) */}
        <div className="team-box home-team">
          <div className="team-badge-circle" aria-hidden="true">
            {homeTeam.badgeNumber ?? 1}
          </div>
          <span className="team-name">{homeTeam.name}</span>
        </div>

        {/* Center score & status */}
        <div className="score-center-box">
          <span className="score-display">{scoreDisplay}</span>
          <span className="score-status-label">{statusLabel}</span>
        </div>

        {/* Team 2 (End/Left in RTL) */}
        <div className="team-box away-team">
          <div className="team-badge-circle" aria-hidden="true">
            {awayTeam.badgeNumber ?? 2}
          </div>
          <span className="team-name">{awayTeam.name}</span>
        </div>
      </div>

      <div className="team-stats-section">
        <h3 className="stats-section-title">{statsTitle}</h3>

        <div className="stats-table">
          {stats.map((stat, idx) => (
            <div key={idx} className="stats-row">
              <span className="stat-value home-stat">{stat.homeValue}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value away-stat">{stat.awayValue}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
