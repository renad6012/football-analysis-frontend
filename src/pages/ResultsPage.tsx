import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResultsHeader from "../features/results/ResultsHeader";
import DemoNoticeBanner from "../features/results/DemoNoticeBanner";
import MatchSummaryCard from "../features/results/MatchSummaryCard";
import DetailedStatsSection from "../features/results/DetailedStatsSection";
import MatchVideoCard from "../features/results/MatchVideoCard";
import MatchEventsCard from "../features/results/MatchEventsCard";
import MatchAskQuestionCard from "../features/results/MatchAskQuestionCard";
import { DEFAULT_DEMO_DATA } from "../features/results/demoData";
import type { MatchAnalysisData, MatchEvent } from "../features/results/types";
import "../features/results/results.css";

interface Props {
  initialData?: MatchAnalysisData;
}

export default function ResultsPage({ initialData }: Props) {
  const { resultId } = useParams<{ resultId: string }>();
  const data = initialData ?? DEFAULT_DEMO_DATA;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (event: MatchEvent) => {
    setSelectedEventId(event.id);
    if (videoRef.current) {
      videoRef.current.currentTime = event.seconds;
      void videoRef.current.play().catch(() => {
        // Autoplay may be restricted by the browser
      });
    }
  };

  return (
    <main className="results-page-container" dir="rtl">
      {/* 1. Header with Breadcrumb, Title and Demo Badge */}
      <ResultsHeader
        category={data.category}
        title={data.title ?? "نتائج تحليل المباراة"}
        subtitle={data.subtitle}
        isDemo={data.isDemo}
      />

      {/* 2. Amber Demo Warning Banner */}
      {data.demoNotice && <DemoNoticeBanner message={data.demoNotice} />}

      {/* 3. Match Summary Card (Teams & Stats) */}
      <MatchSummaryCard
        title="ملخص المباراة"
        homeTeam={data.homeTeam}
        awayTeam={data.awayTeam}
        scoreDisplay={data.scoreDisplay}
        statusLabel={data.statusLabel}
        statsTitle={data.statsTitle}
        stats={data.stats}
      />

      {/* 4. Deep-dive Detailed Statistics Analysis (تحليل الإحصائيات التخصصي والمتقدم) */}
      {data.detailedStats && (
        <DetailedStatsSection data={data.detailedStats} />
      )}

      {/* 5. Two-Column Grid: Match Video (Right) & Important Events (Left in RTL) */}
      <div className="results-content-grid">
        <MatchVideoCard
          ref={videoRef}
          title={data.videoTitle}
          subtitle={data.videoSubtitle}
          videoUrl={data.videoUrl}
          noVideoMessage={data.noVideoMessage}
        />

        <MatchEventsCard
          title={data.eventsTitle}
          events={data.events}
          notice={data.eventsNotice}
          selectedEventId={selectedEventId}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* 6. Ask About the Match Card */}
      <MatchAskQuestionCard
        title={data.askTitle}
        subtitle={data.askSubtitle}
        placeholder={data.askPlaceholder}
        buttonText={data.askButtonText}
      />

      {/* Optional action to start new analysis */}
      <div className="results-bottom-actions">
        <Link className="btn-link" to="/">
          تحليل مباراة أخرى
        </Link>
      </div>

      {resultId && (
        <p className="muted small" style={{ textAlign: "center" }}>
          معرف النتيجة: {resultId}
        </p>
      )}
    </main>
  );
}
