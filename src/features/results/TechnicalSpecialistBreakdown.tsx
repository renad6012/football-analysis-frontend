import type { TechnicalMetricBar } from "./types";

interface Props {
  title?: string;
  subtitle?: string;
  badge?: string;
  metrics: TechnicalMetricBar[];
  tacticalTags: string[];
}

export default function TechnicalSpecialistBreakdown({
  title = "التفصيل الفني التخصصي",
  subtitle = "مقارنة بمتوسطات لاعبي وسط الدوري",
  badge = "مستوى النخبة",
  metrics,
  tacticalTags,
}: Props) {
  return (
    <div className="card technical-breakdown-card">
      <div className="breakdown-header">
        <div className="breakdown-title-group">
          <h3 className="card-section-title">{title}</h3>
          {subtitle && <p className="card-subtitle-text">{subtitle}</p>}
        </div>
        {badge && <span className="elite-badge">{badge}</span>}
      </div>

      <div className="metrics-bars-list">
        {metrics.map((metric) => (
          <div key={metric.id} className="metric-bar-item">
            <div className="metric-bar-labels">
              <div className="metric-name-group">
                <span className="metric-arabic-name">{metric.label}</span>
                {metric.englishLabel && (
                  <span className="metric-english-name">{metric.englishLabel}</span>
                )}
              </div>

              <div className="metric-values-group">
                <span className="metric-main-value">{metric.value}</span>
                {metric.subValue && (
                  <span className="metric-sub-value">({metric.subValue})</span>
                )}
              </div>
            </div>

            <div className="progress-track-container" role="progressbar" aria-valuenow={metric.percentage} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="metric-progress-fill"
                style={{
                  width: `${metric.percentage}%`,
                  backgroundColor: metric.barColor ?? "var(--accent)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="tactical-tags-container" aria-label="الخصائص التكتيكية">
        {tacticalTags.map((tag, idx) => (
          <span key={idx} className="tactical-tag-pill">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
