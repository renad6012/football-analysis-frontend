import type { KeyMetricItem } from "./types";

interface Props {
  kpis: KeyMetricItem[];
}

export default function KeyMetricsCards({ kpis }: Props) {
  return (
    <div className="detailed-kpis-grid" role="region" aria-label="المؤشرات الرئيسية للأداء">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{kpi.title}</span>
            <span className="kpi-icon-circle" aria-hidden="true">
              {kpi.icon}
            </span>
          </div>

          <div className="kpi-main-stat">
            <span className="kpi-number">{kpi.mainValue}</span>
            {kpi.unit && <span className="kpi-unit">{kpi.unit}</span>}
          </div>

          <div className="kpi-sub-stats">
            <span className="kpi-sub-item kpi-sub-left">
              {kpi.accentBadge ? (
                <span className="kpi-accent-pill">{kpi.subLeft}</span>
              ) : (
                kpi.subLeft
              )}
            </span>
            <span className="kpi-sub-item kpi-sub-right">{kpi.subRight}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
