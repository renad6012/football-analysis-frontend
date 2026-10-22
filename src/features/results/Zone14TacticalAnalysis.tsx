export default function Zone14TacticalAnalysis() {
  return (
    <div className="card zone14-card">
      <div className="card-header-block">
        <h3 className="card-section-title">تحليل تمركز وتأثير المنطقة 14 (Zone 14)</h3>
        <p className="card-subtitle-text">
          المربع الذهبي أمام منطقة الجزاء — مؤشرات الاستلام وصناعة الخطورة والتمرير الكاسر للدفاع
        </p>
      </div>

      <div className="zone14-content-grid">
        {/* Tactical Pitch Illustration */}
        <div className="tactical-pitch-box">
          <svg viewBox="0 0 360 240" className="pitch-svg">
            <rect width="360" height="240" fill="#0d2417" rx="8" stroke="#1f442b" strokeWidth="2" />
            {/* Outer border & lines */}
            <rect x="20" y="20" width="320" height="200" fill="none" stroke="#255535" strokeWidth="1.5" />
            <line x1="180" y1="20" x2="180" y2="220" stroke="#255535" strokeWidth="1.5" />
            <circle cx="180" cy="120" r="35" fill="none" stroke="#255535" strokeWidth="1.5" />
            {/* Penalty boxes */}
            <rect x="20" y="60" width="55" height="120" fill="none" stroke="#255535" strokeWidth="1.5" />
            <rect x="285" y="60" width="55" height="120" fill="none" stroke="#255535" strokeWidth="1.5" />
            {/* Goal boxes */}
            <rect x="20" y="85" width="22" height="70" fill="none" stroke="#255535" strokeWidth="1.5" />
            <rect x="318" y="85" width="22" height="70" fill="none" stroke="#255535" strokeWidth="1.5" />

            {/* Zone 14 Highlight Box */}
            <rect
              x="220"
              y="75"
              width="65"
              height="90"
              fill="rgba(46, 204, 113, 0.28)"
              stroke="#2ecc71"
              strokeWidth="2"
              strokeDasharray="4 2"
              rx="4"
            />
            <text x="252" y="115" fill="#ffd866" fontSize="13" fontWeight="800" textAnchor="middle">
              Zone 14
            </text>
            <text x="252" y="132" fill="#e8f1ec" fontSize="10" fontWeight="600" textAnchor="middle">
              (منطقة الخطورة)
            </text>
          </svg>
        </div>

        {/* Stats Grid */}
        <div className="zone14-stats-list">
          <div className="zone-stat-box">
            <span className="zone-stat-label">نسبة الاستحواذ بالمنطقة</span>
            <span className="zone-stat-number">28%</span>
            <span className="zone-stat-hint">أعلى لاعب وسط بالفريق</span>
          </div>
          <div className="zone-stat-box">
            <span className="zone-stat-label">تمريرات حاسمة للمرمى</span>
            <span className="zone-stat-number">12</span>
            <span className="zone-stat-hint">تمريرة كاسرة للخط الأخير</span>
          </div>
          <div className="zone-stat-box">
            <span className="zone-stat-label">دقة التمرير داخل Zone 14</span>
            <span className="zone-stat-number">84.2%</span>
            <span className="zone-stat-hint">+16% عن متوسط الدوري</span>
          </div>
          <div className="zone-stat-box">
            <span className="zone-stat-label">معدل الخطورة المتوقعة (xT)</span>
            <span className="zone-stat-number">0.48</span>
            <span className="zone-stat-hint">لكل 90 دقيقة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
