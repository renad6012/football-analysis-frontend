import { useState, type ChangeEvent, type DragEvent } from "react";
import type { UploadLimits } from "../../types/api";
import { formatBytes, validateVideoFile } from "./validateVideo";

interface Props { limits: UploadLimits; onSubmit: (file: File) => void }

export default function VideoPicker({ limits, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const select = (candidate: File | undefined) => {
    setFile(null);
    if (!candidate) { setError(null); return; }
    const validation = validateVideoFile(candidate, limits);
    setError(validation);
    if (!validation) setFile(candidate);
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => select(event.target.files?.[0]);
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); setDragging(false); select(event.dataTransfer.files[0]);
  };
  const allowed = limits.allowedMimeTypes.map((type) => type.replace("video/", "").toUpperCase()).join(", ");

  return <section className="card picker-card">
    <label className={`drop-zone${dragging ? " dragging" : ""}`} htmlFor="video-file"
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
      <span className="upload-icon" aria-hidden="true">↑</span>
      <strong>Choose a match video or drop it here</strong>
      <span className="muted">Allowed formats: {allowed} · Maximum size: {formatBytes(limits.maxFileSizeBytes)}</span>
      <input id="video-file" type="file" accept={limits.allowedMimeTypes.join(",")} onChange={handleChange} />
    </label>
    {file && <p className="selected-file">{file.name} <span className="muted">({formatBytes(file.size)})</span></p>}
    {error && <p className="error" role="alert">{error}</p>}
    <button type="button" className="primary" disabled={!file} onClick={() => file && onSubmit(file)}>Start analysis</button>
  </section>;
}
