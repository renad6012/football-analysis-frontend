interface Props {
  category?: string;
  title: string;
  subtitle?: string;
  isDemo?: boolean;
}

export default function ResultsHeader({
  category = "RASED / Analysis",
  title,
  subtitle,
  isDemo = true,
}: Props) {
  return (
    <header className="results-header">
      <div className="results-header-title-group">
        {category && <span className="results-category-tag">{category}</span>}
        <h1 className="results-main-title">{title}</h1>
        {subtitle && <p className="results-subtitle">{subtitle}</p>}
      </div>

      {isDemo && (
        <div className="results-demo-badge">
          <span>DEMO — بيانات توضيحية</span>
        </div>
      )}
    </header>
  );
}
