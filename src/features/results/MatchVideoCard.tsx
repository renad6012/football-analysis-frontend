import { forwardRef } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  videoUrl?: string | null;
  noVideoMessage?: string;
}

const MatchVideoCard = forwardRef<HTMLVideoElement, Props>(function MatchVideoCard(
  {
    title = "فيديو المباراة",
    subtitle = "يمكن الانتقال إلى توقيت الحدث إذا كان الفيديو متاحاً وكان التوقيت ضمن مدته.",
    videoUrl = null,
    noVideoMessage = "لا يوجد فيديو متاح",
  },
  ref
) {
  return (
    <section className="card match-video-card" aria-label={title}>
      <div className="card-header-block">
        <h2 className="card-section-title">{title}</h2>
        {subtitle && <p className="card-subtitle-text">{subtitle}</p>}
      </div>

      <div className="video-player-container">
        {videoUrl ? (
          <video
            ref={ref}
            src={videoUrl}
            controls
            className="match-video-element"
            playsInline
          >
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
        ) : (
          <div className="video-empty-state" role="img" aria-label={noVideoMessage}>
            <div className="video-play-icon-box" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 5V19L19 12L7 5Z" fill="#ffffff" />
              </svg>
            </div>
            <p className="no-video-text">{noVideoMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
});

export default MatchVideoCard;
