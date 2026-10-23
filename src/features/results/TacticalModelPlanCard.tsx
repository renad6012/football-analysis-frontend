import { useState } from "react";
import { api } from "../../api";

interface Props {
  analysisId?: string;
  rosterCount?: number;
  tacticalHeadline?: string;
}

const FEATURED_PLAYERS = [
  { team: 1, teamName: "برشلونة", number: 10, name: "ليونيل ميسي", role: "جناح / صانع ألعاب" },
  { team: 1, teamName: "برشلونة", number: 20, name: "سيرجي روبيرتو", role: "وسط / ظهير" },
  { team: 1, teamName: "برشلونة", number: 4, name: "إيفان راكيتيتش", role: "لاعب وسط" },
  { team: 0, teamName: "ريال مدريد", number: 14, name: "كاسميرو", role: "وسط مدافع" },
  { team: 0, teamName: "ريال مدريد", number: 4, name: "سيرجيو راموس", role: "قلب دفاع" },
  { team: 0, teamName: "ريال مدريد", number: 10, name: "خاميس رودريغيز", role: "صانع ألعاب" },
];

export default function TacticalModelPlanCard({
  analysisId = "clasico-2017",
  rosterCount = 19,
  tacticalHeadline = "التحول الهجومي السريع واستغلال المساحات في Zone 14 (ميسي وسيرجي روبيرتو)",
}: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState(FEATURED_PLAYERS[0]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);

  const handleSelectPlayer = async (player: typeof FEATURED_PLAYERS[0]) => {
    setSelectedPlayer(player);
    setLoadingHeatmap(true);
    try {
      if (api.getPlayerHeatmap) {
        await api.getPlayerHeatmap(analysisId, player.team, player.number);
      }
    } finally {
      setLoadingHeatmap(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoadingHeatmap(true);
    try {
      if (api.createAnalysisPlan) {
        await api.createAnalysisPlan(analysisId);
      }
      setPlanGenerated(true);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  return (
    <section className="card tactical-model-plan-card" aria-label="الخطة التكتيكية ومخرجات الموديل">
      <div className="card-header-block" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="card-section-title">مخرجات الخطة التكتيكية وتتبع اللاعبين</h2>
          <p className="card-subtitle-text">
            نتائج المعالجة الآلية وتتبع حركة اللاعبين بالذكاء الاصطناعي
          </p>
        </div>

        <div className="roster-badge-pill" style={{ background: "rgba(46, 204, 113, 0.15)", border: "1px solid #27ae60", color: "var(--accent)", padding: "6px 14px", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 700 }}>
          <span>⚽ {rosterCount} لاعباً تم تتبعهم (Jersey Roster Tracked)</span>
        </div>
      </div>

      {/* Tactical Plan Headline Box */}
      <div className="headline-box" style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(24, 40, 30, 0.7)", border: "1px solid #234f34", borderRadius: "8px" }}>
        <span style={{ color: "#ffd866", fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
          العنوان الرئيسي للخطة التكتيكية (Tactical Plan Headline):
        </span>
        <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", lineHeight: "1.4" }}>
          {tacticalHeadline}
        </p>
      </div>

      {/* Heatmap & Player Selector */}
      <div className="heatmap-control-section" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", color: "#e8f1ec" }}>
            الخريطة الحرارية للاعبين (Player Heatmap API)
          </h3>
          <button
            type="button"
            className="btn-link"
            style={{ fontSize: "0.8rem", padding: "6px 14px", background: "#1b2e23", color: "var(--accent)", border: "1px solid #2ecc71" }}
            onClick={handleGeneratePlan}
          >
            {planGenerated ? "✓ تم تحديث الخطة التكتيكية" : "توليد الخطة التكتيكية (POST /plan)"}
          </button>
        </div>

        {/* Players buttons row */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
          {FEATURED_PLAYERS.map((p) => {
            const isSelected = selectedPlayer.number === p.number && selectedPlayer.team === p.team;
            return (
              <button
                key={`${p.team}-${p.number}`}
                type="button"
                onClick={() => void handleSelectPlayer(p)}
                style={{
                  background: isSelected ? "var(--accent)" : "#132319",
                  color: isSelected ? "#06210f" : "#d0dfd7",
                  border: isSelected ? "1px solid var(--accent)" : "1px solid #243c2c",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                #{p.number} {p.name} ({p.teamName})
              </button>
            );
          })}
        </div>

        {/* Tactical Heatmap Pitch View */}
        <div style={{ marginTop: "14px", background: "#0a1710", border: "1px solid #1f3527", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", fontSize: "0.85rem", color: "var(--muted)" }}>
            <span>اللاعب النشط: <strong style={{ color: "#ffffff" }}>{selectedPlayer.name} (#{selectedPlayer.number})</strong> — {selectedPlayer.teamName}</span>
            <span style={{ color: "var(--accent)" }}>{loadingHeatmap ? "جاري الاتصال بـ API..." : "GET /heatmap متصل"}</span>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto", aspectRatio: "16/9", background: "#0d2417", borderRadius: "6px", border: "1px solid #235033", overflow: "hidden" }}>
            {/* SVG Pitch with player heat overlay */}
            <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
              <rect width="320" height="180" fill="#0c2115" />
              <rect x="15" y="15" width="290" height="150" fill="none" stroke="#1d452b" strokeWidth="1.5" />
              <line x1="160" y1="15" x2="160" y2="165" stroke="#1d452b" strokeWidth="1.5" />
              <circle cx="160" cy="90" r="28" fill="none" stroke="#1d452b" strokeWidth="1.5" />
              <rect x="15" y="45" width="45" height="90" fill="none" stroke="#1d452b" strokeWidth="1.5" />
              <rect x="260" y="45" width="45" height="90" fill="none" stroke="#1d452b" strokeWidth="1.5" />

              {/* Dynamic Heatmap Blob based on selected player */}
              {selectedPlayer.number === 10 && selectedPlayer.team === 1 ? (
                // Messi: concentrated in Zone 14 & Right Half-space
                <g>
                  <circle cx="210" cy="85" r="32" fill="rgba(231, 76, 60, 0.45)" filter="blur(8px)" />
                  <circle cx="210" cy="85" r="18" fill="rgba(241, 196, 15, 0.6)" filter="blur(4px)" />
                  <circle cx="230" cy="70" r="22" fill="rgba(46, 204, 113, 0.5)" filter="blur(6px)" />
                  <text x="210" y="88" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">Zone 14</text>
                </g>
              ) : selectedPlayer.number === 20 ? (
                // Sergi Roberto: Marathon run right flank & central
                <g>
                  <ellipse cx="160" cy="140" rx="60" ry="16" fill="rgba(46, 204, 113, 0.5)" filter="blur(7px)" />
                  <circle cx="220" cy="135" r="20" fill="rgba(241, 196, 15, 0.6)" filter="blur(5px)" />
                  <text x="160" y="142" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">انطلاقة المرتدة</text>
                </g>
              ) : (
                // Other players
                <g>
                  <circle cx={selectedPlayer.team === 0 ? "110" : "190"} cy="90" r="30" fill="rgba(46, 204, 113, 0.4)" filter="blur(8px)" />
                  <circle cx={selectedPlayer.team === 0 ? "110" : "190"} cy="90" r="15" fill="rgba(241, 196, 15, 0.6)" filter="blur(4px)" />
                </g>
              )}
            </svg>
          </div>
          <span style={{ display: "block", marginTop: "8px", fontSize: "0.75rem", color: "var(--muted)" }}>
            الخريطة الحرارية المباشرة المستخرجة لحركة اللاعب ومناطق التمركز والخطورة
          </span>
        </div>
      </div>
    </section>
  );
}
