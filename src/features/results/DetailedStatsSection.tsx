import { useState } from "react";
import KeyMetricsCards from "./KeyMetricsCards";
import PerformanceTrajectoryChart from "./PerformanceTrajectoryChart";
import TechnicalSpecialistBreakdown from "./TechnicalSpecialistBreakdown";
import Zone14TacticalAnalysis from "./Zone14TacticalAnalysis";
import FitnessAndSpeedAnalysis from "./FitnessAndSpeedAnalysis";
import type { DetailedPlayerStats } from "./types";

interface Props {
  data: DetailedPlayerStats;
}

type TabType = "comprehensive" | "zone14" | "fitness";

export default function DetailedStatsSection({ data }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("comprehensive");

  return (
    <section className="detailed-stats-section" aria-label="تحليل الإحصائيات المتقدم">
      {/* Top Status & Transparency Notice */}
      <div className="detailed-status-bar">
        <div className="participation-status-group">
          <span className="status-dot-indicator" aria-hidden="true" />
          <span className="status-main-text">{data.participationStatus}</span>
          <span className="status-divider">•</span>
          <span className="status-readiness-text">{data.physicalReadiness}</span>
        </div>

        <div className="transparency-notice-text">
          <span>{data.transparencyNotice}</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="view-mode-bar">
        <span className="view-mode-label">وضع العرض الحالي:</span>
        <div className="view-mode-tabs" role="tablist">
          <button
            type="button"
            className={`view-mode-tab-btn ${activeTab === "comprehensive" ? "active" : ""}`}
            onClick={() => setActiveTab("comprehensive")}
            role="tab"
            aria-selected={activeTab === "comprehensive"}
          >
            التقرير التنافسي الشامل
          </button>
          <button
            type="button"
            className={`view-mode-tab-btn ${activeTab === "zone14" ? "active" : ""}`}
            onClick={() => setActiveTab("zone14")}
            role="tab"
            aria-selected={activeTab === "zone14"}
          >
            تحليل تمركز Zone 14
          </button>
          <button
            type="button"
            className={`view-mode-tab-btn ${activeTab === "fitness" ? "active" : ""}`}
            onClick={() => setActiveTab("fitness")}
            role="tab"
            aria-selected={activeTab === "fitness"}
          >
            سجل اللياقة البدنية والسرعات
          </button>
        </div>
      </div>

      {/* Tab 1: Comprehensive View */}
      {activeTab === "comprehensive" && (
        <div className="comprehensive-tab-content">
          {/* 4 KPI Cards */}
          <KeyMetricsCards kpis={data.kpis} />

          {/* 2 Columns: Trajectory Chart & Technical Breakdown */}
          <div className="detailed-content-grid">
            <PerformanceTrajectoryChart
              title={data.trajectory.title}
              subtitle={data.trajectory.subtitle}
              benchmarkLabel={data.trajectory.benchmarkLabel}
              benchmarkValue={data.trajectory.benchmarkValue}
              points={data.trajectory.points}
              insightTitle={data.trajectory.insightTitle}
              insightDescription={data.trajectory.insightDescription}
            />

            <TechnicalSpecialistBreakdown
              title={data.specialistMetrics.title}
              subtitle={data.specialistMetrics.subtitle}
              badge={data.specialistMetrics.badge}
              metrics={data.specialistMetrics.metrics}
              tacticalTags={data.specialistMetrics.tacticalTags}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Zone 14 Analysis */}
      {activeTab === "zone14" && <Zone14TacticalAnalysis />}

      {/* Tab 3: Fitness & Speed */}
      {activeTab === "fitness" && <FitnessAndSpeedAnalysis />}
    </section>
  );
}
