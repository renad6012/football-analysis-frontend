export default function FitnessAndSpeedAnalysis() {
  const metrics = [
    { label: "المسافة الكلية المقطوعة", value: "11.4 كم", sub: "معدل 90 دقيقة", percent: 88 },
    { label: "السرعة القصوى (Top Speed)", value: "33.2 كم/س", sub: "دقيقة 72 ضد الخصم", percent: 82 },
    { label: "عدد سباقات السرعة (Sprints > 25km/h)", value: "38 سبرينت", sub: "Top 5% بالدوري", percent: 92 },
    { label: "المسافة عالية الشدة (High-Intensity)", value: "1,850 م", sub: "كثافة بدنية مرتفعة", percent: 85 },
    { label: "مؤشر الجاهزية والاسترجاع", value: "96%", sub: "حالة بدنية ممتازة", percent: 96 },
  ];

  return (
    <div className="card fitness-analysis-card">
      <div className="card-header-block">
        <h3 className="card-section-title">سجل اللياقة البدنية والسرعات (Physical & Speed Tracking)</h3>
        <p className="card-subtitle-text">
          بيانات الأحمال البدنية والسرعات المجمعة عبر حساسات التتبع GPS والتحليل البصري
        </p>
      </div>

      <div className="fitness-metrics-grid">
        {metrics.map((m, idx) => (
          <div key={idx} className="fitness-item-box">
            <div className="fitness-item-header">
              <span className="fitness-label">{m.label}</span>
              <span className="fitness-value">{m.value}</span>
            </div>
            <div className="progress-track-container" role="progressbar" aria-valuenow={m.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="metric-progress-fill" style={{ width: `${m.percent}%`, backgroundColor: "#2ecc71" }} />
            </div>
            <span className="fitness-sub">{m.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
