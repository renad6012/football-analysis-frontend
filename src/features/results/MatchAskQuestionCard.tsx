import { useState, type FormEvent } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onAskQuestion?: (question: string) => void;
}

export default function MatchAskQuestionCard({
  title = "اسأل عن المباراة",
  subtitle = "تظهر الإجابة والأدلة عند توفر خدمة الأسئلة والأجوبة.",
  placeholder = "اكتبي سؤالاً عن المباراة",
  buttonText = "إرسال السؤال",
  onAskQuestion,
}: Props) {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setSubmittedQuestion(trimmed);
    onAskQuestion?.(trimmed);
    setQuestion("");
  };

  return (
    <section className="card match-ask-card" aria-label={title}>
      <div className="card-header-block">
        <h2 className="card-section-title">{title}</h2>
        {subtitle && <p className="card-subtitle-text">{subtitle}</p>}
      </div>

      <form className="ask-form-row" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          className="ask-input-field"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />

        <button type="submit" className="primary ask-submit-button">
          {buttonText}
        </button>
      </form>

      {submittedQuestion && (
        <div className="ask-response-box" role="status">
          <p className="muted small">
            تم استلام السؤال: &quot;{submittedQuestion}&quot; — خدمة الأسئلة والأجوبة قيد التجربة في هذا الإصدار.
          </p>
        </div>
      )}
    </section>
  );
}
