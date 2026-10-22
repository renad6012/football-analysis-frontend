import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useJobStatus } from "../features/analysis/useJobStatus";
import ResultsHeader from "../features/results/ResultsHeader";
import MatchSummaryCard from "../features/results/MatchSummaryCard";
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
 * دالة استخراج وتنسيق البيانات القادمة مباشرة من استجابة الباك إند API (job.result)
 * دون استبدالها بأي بيانات وهمية أو ديمو
 */
function parseBackendResult(job: AnalysisJob): MatchAnalysisData {
  const raw =
    job.result && typeof job.result === "object"
      ? (job.result as Record<string, unknown>)
      : {};

  const homeTeamName =
    (raw.homeTeam as string) || (raw.home_team as string) || "الفريق الأول";
  const awayTeamName =
    (raw.awayTeam as string) || (raw.away_team as string) || "الفريق الثاني";
  const scoreDisplay =
    (raw.score as string) || (raw.scoreDisplay as string) || "—";
  const statusLabel =
    (raw.statusLabel as string) || "نتائج التحليل من السيرفر";

  // استخراج الإحصائيات من رد الباك إند الحقيقي
  let stats: MatchStatRow[] = [
    { label: "الاستحواذ", homeValue: "—", awayValue: "—" },
    { label: "التسديدات", homeValue: "—", awayValue: "—" },
    { label: "التسديدات على المرمى", homeValue: "—", awayValue: "—" },
  ];

  if (Array.isArray(raw.stats)) {
    stats = raw.stats as MatchStatRow[];
  } else if (raw.stats && typeof raw.stats === "object") {
    const s = raw.stats as Record<string, Record<string, string | number>>;
    stats = [
      {
        label: "الاستحواذ",
        homeValue: s.possession?.home ?? "—",
        awayValue: s.possession?.away ?? "—",
      },
      {
        label: "التسديدات",
        homeValue: s.shots?.home ?? "—",
        awayValue: s.shots?.away ?? "—",
      },
      {
        label: "التسديدات على المرمى",
        homeValue: s.shotsOnTarget?.home ?? "—",
        awayValue: s.shotsOnTarget?.away ?? "—",
      },
    ];
  }

  // استخراج الأحداث من رد الباك إند
  const events: MatchEvent[] = Array.isArray(raw.events)
    ? (raw.events as MatchEvent[])
    : [];

  // استخراج الإحصائيات التفصيلية إذا أرجعها الباك إند
  const detailedStats = (raw.detailedStats || raw.detailed_stats) as
    | DetailedPlayerStats
    | undefined;

  return {
    id: job.jobId,
    isDemo: false,
    category: "RASED / Analysis",
    title: (raw.title as string) || "نتائج تحليل المباراة",
    subtitle:
      (raw.subtitle as string) ||
      "ملخص المباراة والأحداث المستخرجة من السيرفر",
    homeTeam: {
      name: homeTeamName,
      badgeNumber: 1,
    },
    awayTeam: {
      name: awayTeamName,
      badgeNumber: 2,
    },
    scoreDisplay,
    statusLabel,
    statsTitle: "إحصائيات الفريقين",
    stats,
    eventsTitle: "الأحداث المهمة",
    events,
    eventsNotice:
      events.length === 0
        ? "لم يستخرج السيرفر أحداثاً مسجلة من هذا الفيديو بعد."
        : undefined,
    videoTitle: "فيديو المباراة",
    videoSubtitle: "الفيديو المسجل لدى السيرفر",
    videoUrl: (raw.videoUrl as string) || (raw.video_url as string) || null,
    noVideoMessage: "لا يوجد رابط فيديو مسجل في نتيجة السيرفر",
    askTitle: "اسأل عن المباراة",
    askSubtitle: "تظهر الإجابة والأدلة عند توفر خدمة الأسئلة والأجوبة.",
    askPlaceholder: "اكتب سؤالاً عن المباراة",
    askButtonText: "إرسال السؤال",
    detailedStats,
  };
}

export default function ResultsPage({ initialData }: Props) {
  const { resultId, jobId } = useParams<{ resultId?: string; jobId?: string }>();
  const targetId = resultId || jobId || "";

  // جلب البيانات من الباك إند عبر الـ API الفعلي مباشرة
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

  // 1. في حال عدم إرسال معرف للتحليل
  if (!initialData && !targetId) {
    return (
      <main className="results-page-container" dir="rtl">
        <header className="results-header">
          <div className="results-header-title-group">
            <span className="results-category-tag">RASED / Analysis</span>
            <h1 className="results-main-title">نتائج تحليل المباراة</h1>
          </div>
        </header>
        <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <p className="muted" style={{ marginBottom: "16px" }}>
            لم يتم تمرير معرف تحليل (Analysis ID) لجلب بياناته من الباك إند.
          </p>
          <Link className="primary btn-link" to="/" style={{ display: "inline-block", padding: "10px 20px" }}>
            بدء تحليل مباراة جديدة
          </Link>
        </div>
      </main>
    );
  }

  // 2. حالة الخطأ القادم من السيرفر
  if (error) {
    return (
      <main className="results-page-container" dir="rtl">
        <div className="card">
          <div className="alert" role="alert">
            <p>{error.message}</p>
            <div className="actions" style={{ marginTop: "12px" }}>
              <button type="button" onClick={retry}>
                إعادة المحاولة
              </button>
              <Link className="btn-link" to="/">
                تحليل جديد
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. حالة التحميل بانتظار استجابة السيرفر
  if (!initialData && !job) {
    return (
      <main className="results-page-container" dir="rtl">
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div className="progress-track" style={{ maxWidth: "320px", margin: "0 auto 16px" }}>
            <div className="progress-fill indeterminate" />
          </div>
          <p className="muted">جاري إرسال طلب للباك إند وجلب البيانات الحقيقية ({targetId})...</p>
        </div>
      </main>
    );
  }

  // 4. حالة السيرفر الحقيقية إذا كان الطلب قيد الانتظار أو المعالجة (PENDING / PROCESSING)
  if (job && job.status !== "completed") {
    const isQueued = job.status === "queued";
    return (
      <main className="results-page-container" dir="rtl">
        <header className="results-header">
          <div className="results-header-title-group">
            <span className="results-category-tag">RASED / Analysis</span>
            <h1 className="results-main-title">حالة التحليل من السيرفر</h1>
            <p className="results-subtitle">معرف الطلب: {job.jobId}</p>
          </div>
        </header>

        <div className="card" style={{ padding: "28px", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>
            {isQueued
              ? "الطلب قيد الانتظار في طابور السيرفر (PENDING)"
              : "جاري تحليل الفيديو في السيرفر (PROCESSING)"}
          </h2>
          <p className="muted" style={{ maxWidth: "560px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            {isQueued
              ? "السيرفر استلم الفيديو بنجاح، وهو الآن بانتظار بدء المعالجة من نموذج الذكاء الاصطناعي."
              : `التحليل قيد المعالجة بنسبة ${job.progress ?? 0}%`}
          </p>

          <div className="actions" style={{ justifyContent: "center", gap: "10px" }}>
            <button
              type="button"
              className="primary"
              style={{ width: "auto", padding: "10px 24px" }}
              onClick={retry}
            >
              تحديث الحالة من السيرفر
            </button>
            <Link className="btn-link" to={`/analysis/${job.jobId}`}>
              متابعة شريط التقدم
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 5. حالة اكتمال الطلب - استخدام بيانات السيرفر الفعلية فقط
  const data: MatchAnalysisData = initialData ?? (job ? parseBackendResult(job) : null!);

  if (!data || !job?.result) {
    return (
      <main className="results-page-container" dir="rtl">
        <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <p className="muted">
            {job?.status === "completed"
              ? "اكتمل الطلب في السيرفر ولكن كائن النتيجة (result) فارغ حتى الآن."
              : "لا توجد نتائج متاحة لهذا الطلب من السيرفر."}
          </p>
          <div style={{ marginTop: "16px" }}>
            <Link className="btn-link" to="/">
              تحليل جديد
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="results-page-container" dir="rtl">
      {/* 1. رأس الصفحة */}
      <ResultsHeader
        category={data.category}
        title={data.title ?? "نتائج تحليل المباراة"}
        subtitle={data.subtitle}
        isDemo={false}
      />

      {/* 2. بطاقة ملخص المباراة المستخرجة من الباك إند */}
      <MatchSummaryCard
        title={data.title ? "ملخص المباراة" : "ملخص المباراة"}
        homeTeam={data.homeTeam}
        awayTeam={data.awayTeam}
        scoreDisplay={data.scoreDisplay}
        statusLabel={data.statusLabel}
        statsTitle={data.statsTitle}
        stats={data.stats}
      />

      {/* 3. الإحصائيات التفصيلية إن وجدت في رد الباك إند */}
      {data.detailedStats ? (
        <DetailedStatsSection data={data.detailedStats} />
      ) : null}

      {/* 4. قسم فيديو المباراة والأحداث القادمة من الباك إند */}
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

      {/* 5. قسم السؤال عن المباراة */}
      <MatchAskQuestionCard
        title={data.askTitle}
        subtitle={data.askSubtitle}
        placeholder={data.askPlaceholder}
        buttonText={data.askButtonText}
      />

      {/* روابط التنقل في الأسفل */}
      <div className="results-bottom-actions">
        <Link className="btn-link" to="/">
          تحليل مباراة أخرى
        </Link>
      </div>

      {targetId && (
        <p className="muted small" style={{ textAlign: "center" }}>
          معرف التحليل المستدعى من الباك إند: {targetId}
        </p>
      )}
    </main>
  );
}
