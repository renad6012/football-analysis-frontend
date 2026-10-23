import { useState, type ReactNode } from "react";

const MAX_BARS = 20;
const MAX_ROWS = 50;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const isPrimitive = (v: unknown): v is string | number | boolean | null | undefined =>
  v === null || v === undefined || ["string", "number", "boolean"].includes(typeof v);

function humanize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatValue(v: unknown): string {
  if (isNumber(v)) return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v === null || v === undefined) return "—";
  return String(v);
}

function cellText(v: unknown): string {
  return isPrimitive(v) ? formatValue(v) : JSON.stringify(v);
}

// ---------- charts ----------

interface BarItem {
  label: string;
  value: number;
}

function BarChart({ items }: { items: BarItem[] }) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  return (
    <div className="bars">
      {items.map((item, i) => (
        <div className="bar-row" key={`${i}-${item.label}`}>
          <span className="bar-label" title={item.label}>
            {item.label}
          </span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(Math.abs(item.value) / max) * 100}%` }}
            />
          </div>
          <span className="bar-value">{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ values }: { values: number[] }) {
  const step = Math.ceil(values.length / 500);
  const series = step > 1 ? values.filter((_, i) => i % step === 0) : values;
  const min = series.reduce((a, b) => Math.min(a, b), Infinity);
  const max = series.reduce((a, b) => Math.max(a, b), -Infinity);
  const span = max - min || 1;
  const w = 600;
  const h = 140;
  const pad = 8;

  const points = series
    .map((v, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="line-chart" role="img" aria-label="Line chart">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <p className="muted small">
        Min {formatValue(min)} · Max {formatValue(max)} · {values.length} points
      </p>
    </div>
  );
}

// ---------- blocks ----------

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dash-card">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function StatGrid({ entries }: { entries: [string, unknown][] }) {
  return (
    <div className="stat-grid">
      {entries.map(([key, value]) => (
        <div className="stat" key={key}>
          <span className="stat-value">{formatValue(value)}</span>
          <span className="stat-label">{humanize(key)}</span>
        </div>
      ))}
    </div>
  );
}

function toBarItems(
  rows: Record<string, unknown>[],
  labelKey: string,
  metric: string
): BarItem[] {
  return rows.slice(0, MAX_BARS).map((row) => {
    const raw = row[metric];
    return { label: String(row[labelKey]), value: isNumber(raw) ? raw : 0 };
  });
}

function ArrayBlock({ items }: { items: unknown[] }) {
  const [metric, setMetric] = useState<string | null>(null);

  if (items.length === 0) return <p className="muted">No data.</p>;

  // array of numbers
  if (items.every(isNumber)) {
    return items.length > MAX_BARS ? (
      <LineChart values={items} />
    ) : (
      <BarChart items={items.map((value, i) => ({ label: `#${i + 1}`, value }))} />
    );
  }

  // array of objects (players, events, ...)
  const rows = items.filter(isObject);
  if (rows.length === items.length) {
    const first = rows[0];
    const keys = Object.keys(first);
    const labelKey = keys.find((k) => typeof first[k] === "string");
    const numericKeys = keys.filter((k) => isNumber(first[k]));
    const activeMetric = metric && numericKeys.includes(metric) ? metric : numericKeys[0];

    return (
      <>
        {labelKey && activeMetric && (
          <>
            {numericKeys.length > 1 && (
              <select
                value={activeMetric}
                onChange={(e) => setMetric(e.target.value)}
                aria-label="Metric"
              >
                {numericKeys.map((k) => (
                  <option key={k} value={k}>
                    {humanize(k)}
                  </option>
                ))}
              </select>
            )}
            <BarChart items={toBarItems(rows, labelKey, activeMetric)} />
          </>
        )}
        <details>
          <summary>View table ({rows.length} rows)</summary>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {keys.map((k) => (
                    <th key={k}>{humanize(k)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, MAX_ROWS).map((row, i) => (
                  <tr key={i}>
                    {keys.map((k) => (
                      <td key={k}>{cellText(row[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </>
    );
  }

  // anything else
  return (
    <ul className="chips">
      {items.slice(0, MAX_ROWS).map((v, i) => (
        <li key={i}>{cellText(v)}</li>
      ))}
    </ul>
  );
}

function ValueBlock({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <ArrayBlock items={value} />;

  if (isObject(value)) {
    const entries = Object.entries(value);
    const allNumbers = entries.length >= 2 && entries.every(([, v]) => isNumber(v));
    if (allNumbers) {
      return (
        <BarChart
          items={entries.map(([label, v]) => ({
            label: humanize(label),
            value: v as number,
          }))}
        />
      );
    }
    return <ObjectBlock data={value} />;
  }

  return <p>{formatValue(value)}</p>;
}

function ObjectBlock({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  const primitives = entries.filter(([, v]) => isPrimitive(v));
  const nested = entries.filter(([, v]) => !isPrimitive(v));

  return (
    <>
      {primitives.length > 0 && <StatGrid entries={primitives} />}
      {nested.map(([key, value]) => (
        <Card key={key} title={humanize(key)}>
          <ValueBlock value={value} />
        </Card>
      ))}
    </>
  );
}

// ---------- main ----------

export default function ResultDashboard({ result }: { result: unknown }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="dashboard">
      {isObject(result) ? <ObjectBlock data={result} /> : <ValueBlock value={result} />}

      <button type="button" className="link-button" onClick={() => setShowRaw((s) => !s)}>
        {showRaw ? "Hide raw data" : "Show raw data"}
      </button>
      {showRaw && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}