import { useState } from "react";
import type { TrajectoryPoint } from "./types";

interface Props {
  title?: string;
  subtitle?: string;
  benchmarkLabel?: string;
  benchmarkValue?: number;
  points: TrajectoryPoint[];
  insightTitle?: string;
  insightDescription?: string;
}

type MetricMode = "rating" | "passing" | "xg";

export default function PerformanceTrajectoryChart({
  title = "تطور أداء اللاعب عبر المباريات (Performance Trajectory)",
  subtitle = "مؤشر التقييم الفني المركب لكل 90 دقيقة",
  benchmarkLabel = "متوسط لاعبي الوسط بالدوري: 7.4",
  benchmarkValue = 7.4,
  points,
  insightTitle = "مؤشر صاعد: تحسن تكتيكي لافت (+24%)",
  insightDescription = "تحسن ملحوظ في صناعة الفرص والتمركز بين الخطوط خلال آخر 3 جولات، مدفوعاً بزيادة التمرير العمودي ودقة التمريرات الكاسرة للخط الدفاعي الأخير Zone 14",
}: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricMode>("rating");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // SVG Chart Dimensions
  const width = 580;
  const height = 240;
  const paddingX = 45;
  const paddingTop = 35;
  const paddingBottom = 40;

  // Compute values based on selected metric
  const values = points.map((p) => {
    if (activeMetric === "passing") return p.passing;
    if (activeMetric === "xg") return p.xg;
    return p.rating;
  });

  const minVal = activeMetric === "rating" ? 6.8 : activeMetric === "passing" ? 75 : 0;
  const maxVal = activeMetric === "rating" ? 9.2 : activeMetric === "passing" ? 95 : 1.5;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate SVG coordinates for each point (RTL: point 0 is at right or left? In Arabic charts, time usually flows from past to present, so Round 9 -> Round 14)
  const coords = points.map((_, index) => {
    const x = paddingX + (index / (points.length - 1)) * chartWidth;
    const normalizedY = (values[index] - minVal) / (maxVal - minVal);
    const y = height - paddingBottom - normalizedY * chartHeight;
    return { x, y, val: values[index] };
  });

  // Generate SVG smooth bezier path
  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path (closed at the bottom)
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  // Benchmark line Y coordinate (for rating)
  const benchmarkY =
    activeMetric === "rating"
      ? height - paddingBottom - ((benchmarkValue - minVal) / (maxVal - minVal)) * chartHeight
      : null;

  return (
    <div className="card performance-trajectory-card">
      {/* Header and Toggle Tabs */}
      <div className="trajectory-header">
        <div className="trajectory-title-group">
          <h3 className="card-section-title">{title}</h3>
          {subtitle && <p className="card-subtitle-text">{subtitle}</p>}
        </div>

        <div className="metric-toggle-group" role="tablist">
          <button
            type="button"
            className={`metric-toggle-btn ${activeMetric === "rating" ? "active" : ""}`}
            onClick={() => setActiveMetric("rating")}
          >
            التقييم الفني
          </button>
          <button
            type="button"
            className={`metric-toggle-btn ${activeMetric === "passing" ? "active" : ""}`}
            onClick={() => setActiveMetric("passing")}
          >
            دقة التمرير %
          </button>
          <button
            type="button"
            className={`metric-toggle-btn ${activeMetric === "xg" ? "active" : ""}`}
            onClick={() => setActiveMetric("xg")}
          >
            المساهمات xG
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="trajectory-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="trajectory-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.01" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2ecc71" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - paddingBottom - ratio * chartHeight;
            const val = (minVal + ratio * (maxVal - minVal)).toFixed(activeMetric === "xg" ? 2 : 1);
            return (
              <g key={idx} className="chart-grid-line">
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={width - paddingX + 10}
                  y2={y}
                  stroke="#23382b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text x={paddingX - 16} y={y + 4} fill="#6d8577" fontSize="11" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Benchmark Reference Line */}
          {benchmarkY !== null && (
            <g className="benchmark-line-group">
              <line
                x1={paddingX}
                y1={benchmarkY}
                x2={width - paddingX}
                y2={benchmarkY}
                stroke="#6d8577"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={width - paddingX}
                y={benchmarkY - 6}
                fill="#8ea799"
                fontSize="11"
                textAnchor="end"
                fontWeight="500"
              >
                {benchmarkLabel}
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Main Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2ecc71"
            strokeWidth="3"
            filter="url(#glow)"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {coords.map((coord, idx) => {
            const isHovered = hoveredPointIndex === idx;
            const isPeak = points[idx].isPeak && activeMetric === "rating";
            return (
              <g key={idx} className="chart-point-group">
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered ? 7 : isPeak ? 6 : 4.5}
                  fill="#0f1a14"
                  stroke={isPeak ? "#ffd866" : "#2ecc71"}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                />

                {/* Value Label above point */}
                <text
                  x={coord.x}
                  y={coord.y - 12}
                  fill={isPeak ? "#ffd866" : "#e8f1ec"}
                  fontSize={isPeak ? "12" : "11"}
                  fontWeight={isPeak ? "700" : "600"}
                  textAnchor="middle"
                >
                  {coord.val}
                </text>

                {/* Peak Badge */}
                {isPeak && (
                  <g transform={`translate(${coord.x - 36}, ${coord.y - 32})`}>
                    <rect
                      width="72"
                      height="18"
                      rx="9"
                      fill="#174426"
                      stroke="#2ecc71"
                      strokeWidth="1"
                    />
                    <text
                      x="36"
                      y="13"
                      fill="#ffd866"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      ★ 8.8 (الأعلى)
                    </text>
                  </g>
                )}

                {/* X Axis Round Label */}
                <text
                  x={coord.x}
                  y={height - 12}
                  fill={isPeak ? "#2ecc71" : "#8ea799"}
                  fontSize="11"
                  fontWeight={isPeak ? "700" : "500"}
                  textAnchor="middle"
                >
                  {points[idx].round}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Insight Banner at bottom */}
      <div className="trajectory-insight-banner">
        <div className="insight-header">
          <span className="insight-icon" aria-hidden="true">📈</span>
          <span className="insight-title">{insightTitle}</span>
        </div>
        <p className="insight-description">{insightDescription}</p>
      </div>
    </div>
  );
}
