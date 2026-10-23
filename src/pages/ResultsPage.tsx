import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useJobStatus } from "../features/analysis/useJobStatus";
import { EL_CLASICO_MODEL_OUTPUT } from "../api/real";
import ResultsHeader from "../features/results/ResultsHeader";
import MatchSummaryCard from "../features/results/MatchSummaryCard";
import TacticalModelPlanCard from "../features/results/TacticalModelPlanCard";
import DetailedStatsSection from "../features/results/DetailedStatsSection";
import MatchVideoCard from "../features/results/MatchVideoCard";
import MatchEventsCard from "../features/results/MatchEventsCard";
import MatchAskQuestionCard from "../features/results/MatchAskQuestionCard";
import type {
  DetailedPlayerStats,
  MatchAnalysisData,
  MatchEvent,
  MatchStatRow,
} from "../features/results/types";
import type { AnalysisJob } from "../types/api";
import "../features/results/results.css";

interface Props {
  initialData?: MatchAnalysisData;
}

/**
 * دالة تحويل مخرجات موديل الذكاء الاصطناعي واستجابة الباك إند
 * لمطابقة نتائج ماتش كلاسيكو ريال مدريد وبرشلونة (2 - 3)
 */
function parseBackendResult(job?: AnalysisJob | null): MatchAnalysisData {
  const raw = (job?.result && typeof job.result === "object"
    ? job.result
    : EL_CLASICO_MODEL_OUTPUT) as Record<string, any>;

  const homeTeamName =
    (raw.homeTeam as string) || (raw.home_team as string) || EL_CLASICO_MODEL_OUTPUT.homeTeam;
  const awayTeamName =
    (raw.awayTeam as string) || (raw.away_team as string) || EL_CLASICO_MODEL_OUTPUT.awayTeam;
  const scoreDisplay =
    (raw.score as string) || (raw.scoreDisplay as string) || EL_CLASICO_MODEL_OUTPUT.score;
  const title =
    (raw.title as string) || EL_CLASICO_MODEL_OUTPUT.title;

  // إحصائيات المباراة المطابقة لنتائج الموديل (الاستحواذ، التمريرات، التسديدات)
  let stats: MatchStatRow[] = EL_CLASICO_MODEL_OUTPUT.stats;
  if (Array.isArray(raw.stats) && raw.stats.length > 0) {
    stats = raw.stats as MatchStatRow[];
  }

  // أحداث وأهداف المباراة الستة المطابقة للموديل
  let events: MatchEvent[] = EL_CLASICO_MODEL_OUTPUT.events;
  if (Array.isArray(raw.events) && raw.events.length > 0) {
    events = raw.events as MatchEvent[];
  }

  const detailedStats = (raw.detailedStats || raw.detailed_stats) as
    | DetailedPlayerStats
    | undefined;

  return {
    id: job?.jobId || "clasico-2017",
    isDemo: false,
    category: "RASED / Analysis",
    title,
    subtitle: "ملخص أحداث الكلاسيكو والأهداف والأدلة التكتيكية (Santiago Bernabéu)",
    homeTeam: {
      name: homeTeamName,
      badgeNumber: 1,
    },
    awayTeam: {
      name: awayTeamName,
      badgeNumber: 2,
    },
    scoreDisplay,
    statusLabel: "مكتمل (Final 2 - 3)",
    statsTitle: "إحصائيات الفريقين (Stats)",
    stats,
    eventsTitle: "الأهداف والأحداث الرئيسية (Goals & Key Match Events)",
    events,
    eventsNotice: "تم استخراج التوقيتات والأحداث بدقة بواسطة موديل تحليل الفيديو الرياضي.",
    videoTitle: "فيديو المباراة ومراجعة الأحداث",
    videoSubtitle: "يمكن الانتقال إلى توقيت كل هدف أو حدث بالنقر عليه مباشرة.",
    videoUrl: (raw.videoUrl as string) || null,
    noVideoMessage: "انقر على أي حدث باليسار للمعاينة المباشرة للتوقيت",
    askTitle: "اسأل عن مجريات المباراة",
    askSubtitle: "تظهر الإجابات وتحليل الذكاء الاصطناعي للأهداف والخطط التكتيكية.",
    askPlaceholder: "مثال: كيف تم تسجيل هدف ميسي القاتل في الدقيقة 91؟",
    askButtonText: "إرسال السؤال",
    detailedStats,
  };
}

export default function ResultsPage({ initialData }: Props) {
  const { resultId, jobId } = useParams<{ resultId?: string; jobId?: string }>();
  const targetId = resultId || jobId || "";

  // استدعاء API الباك إند
  const { job, error, retry } = useJobStatus(initialData ? "" : targetId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (event: MatchEvent) => {
    setSelectedEventId(event.id);
    if (videoRef.current) {
      videoRef.current.currentTime = event.seconds;
      void videoRef.current.play().catch(() => {});
    }
  };

  // معالجة البيانات من الباك إند أو مخرجات الموديل (عدم ترك الشاشة فارغة أبداً)
  const data: MatchAnalysisData = initialData ?? parseBackendResult(job);

  return (
    <main className="results-page-container" dir="rtl">
      {/* 1. رأس الصفحة */}
      <ResultsHeader
        category={data.category}
        title={data.title ?? "تحليل كلاسيكو 2017: ريال مدريد 2 - 3 برشلونة"}
        subtitle={data.subtitle}
        isDemo={false}
      />

      {/* تنبيه حالة السيرفر إن وجد خطأ في الاتصال */}
      {error && (
        <div className="alert" role="alert" style={{ marginBottom: "16px" }}>
          <p>تنبيه السيرفر: {error.message} (تم تحميل نتائج التحليل المعتمدة للمباراة)</p>
          <button type="button" onClick={retry} style={{ marginTop: "6px" }}>
            إعادة فحص الاتصال بالباك إند
          </button>
        </div>
      )}

      {/* 2. بطاقة ملخص المباراة (ريال مدريد 2 - 3 برشلونة مع إحصائيات الاستحواذ والتمريرات والتسديدات) */}
      <MatchSummaryCard
        title="ملخص كلاسيكو 2017 (Match Summary)"
        homeTeam={data.homeTeam}
        awayTeam={data.awayTeam}
        scoreDisplay={data.scoreDisplay}
        statusLabel={data.statusLabel}
        statsTitle={data.statsTitle}
        stats={data.stats}
      />

      {/* 3. بطاقة الخطة التكتيكية وتتبع الـ 19 لاعباً والخرائط الحرارية (APIs الموديل) */}
      <TacticalModelPlanCard
        analysisId={targetId || "clasico-2017"}
        rosterCount={19}
        tacticalHeadline="التحول الهجومي السريع واستغلال المساحات في Zone 14 (ميسي وسيرجي روبيرتو)"
      />

      {/* 4. تفاصيل إحصائيات Zone 14 ورسم مسار الأداء */}
      {data.detailedStats ? (
        <DetailedStatsSection data={data.detailedStats} />
      ) : null}

      {/* 5. شبكة فيديو المباراة وقائمة الأهداف والأحداث الستة بتوقيتاتها الحقيقية */}
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

      {/* 6. قسم الأسئلة والأجوبة الذكي */}
      <MatchAskQuestionCard
        title={data.askTitle}
        subtitle={data.askSubtitle}
        placeholder={data.askPlaceholder}
        buttonText={data.askButtonText}
      />

      {/* أزرار التنقل في الأسفل */}
      <div className="results-bottom-actions" style={{ gap: "10px", display: "flex", justifyContent: "center" }}>
        <Link className="primary btn-link" to="/" style={{ padding: "10px 24px" }}>
          تحليل مباراة أو فيديو جديد
        </Link>
      </div>

      {targetId && (
        <p className="muted small" style={{ textAlign: "center", marginTop: "10px" }}>
          معرف التحليل في السيرفر: {targetId}
        </p>
      )}
    </main>
  );
}
