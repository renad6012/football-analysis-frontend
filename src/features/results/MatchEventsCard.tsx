import type { MatchEvent } from "./types";

interface Props {
  title?: string;
  events: MatchEvent[];
  notice?: string;
  onSelectEvent?: (event: MatchEvent) => void;
  selectedEventId?: string | null;
}

export default function MatchEventsCard({
  title = "الأحداث المهمة",
  events,
  notice = "الأحداث والتوثيقات في وضع Demo أمثلة فقط، وليست مستخرجة من فيديو حقيقي.",
  onSelectEvent,
  selectedEventId,
}: Props) {
  return (
    <section className="card match-events-card" aria-label={title}>
      <h2 className="card-section-title">{title}</h2>

      <div className="events-list">
        {events.map((event) => {
          const isSelected = selectedEventId === event.id;
          return (
            <div
              key={event.id}
              className={`event-item-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectEvent?.(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectEvent?.(event);
                }
              }}
            >
              <div className="event-info">
                <span className="event-title">{event.title}</span>
                <span className="event-subtitle">{event.subtitle}</span>
              </div>

              <div className="event-time-badge">
                <span>{event.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {notice && <p className="events-notice-text">{notice}</p>}
    </section>
  );
}
