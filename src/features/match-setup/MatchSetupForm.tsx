import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchSchema, type MatchFormValues } from "./matchSchema";
import { formatBytes, validateVideoFile } from "../upload/validateVideo";
import type { MatchMetadata, UploadLimits } from "../../types/api";

interface Props {
  limits: UploadLimits;
  initialValues?: MatchFormValues;
  onSubmit: (metadata: MatchMetadata, file: File) => void;
}
export default function MatchSetupForm({ limits, initialValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: initialValues,
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(null);
    if (!selected) {
      setFileError(null);
      return;
    }
    const error = validateVideoFile(selected, limits);
    setFileError(error);
    if (!error) setFile(selected);
  };

  const submit = (values: MatchFormValues) => {
    if (!file) {
      setFileError("Please choose a match video.");
      return;
    }
    onSubmit(values, file);
  };

  const today = new Date().toISOString().split("T")[0];
  const allowedLabel = limits.allowedMimeTypes
    .map((t) => t.replace("video/", "").toUpperCase())
    .join(", ");

  return (
    <form className="card" onSubmit={handleSubmit(submit)} noValidate>
      <div className="field">
        <label htmlFor="homeTeam">Home team *</label>
        <input id="homeTeam" type="text" {...register("homeTeam")} />
        {errors.homeTeam && <span className="error">{errors.homeTeam.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="awayTeam">Away team *</label>
        <input id="awayTeam" type="text" {...register("awayTeam")} />
        {errors.awayTeam && <span className="error">{errors.awayTeam.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="matchDate">Match date *</label>
        <input id="matchDate" type="date" max={today} {...register("matchDate")} />
        {errors.matchDate && <span className="error">{errors.matchDate.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="competition">Competition (optional)</label>
        <input id="competition" type="text" {...register("competition")} />
      </div>

      <div className="field">
        <label htmlFor="video">Match video *</label>
        <input
          id="video"
          type="file"
          accept={limits.allowedMimeTypes.join(",")}
          onChange={handleFileChange}
        />
        <span className="hint">
          Allowed: {allowedLabel} · Max size: {formatBytes(limits.maxFileSizeBytes)}
        </span>
        {file && (
          <span className="hint">
            Selected: {file.name} ({formatBytes(file.size)})
          </span>
        )}
        {fileError && <span className="error">{fileError}</span>}
      </div>

      <button type="submit" className="primary">
        Start analysis
      </button>
    </form>
  );
}