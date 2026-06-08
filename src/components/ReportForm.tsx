"use client";

import { useState } from "react";
import { insertCommunityReport } from "@/lib/supabase";
import { formatMapPinLabel } from "@/lib/format";
import { MapPinIcon, PlusIcon } from "./icons";

interface ReportFormProps {
  onSuccess: (report: {
    id: string;
    lat: number;
    lng: number;
  }) => void | Promise<void>;
  pickedPosition: { lat: number; lng: number } | null;
  pickMode: boolean;
  onTogglePickMode: () => void;
}

export default function ReportForm({
  onSuccess,
  pickedPosition,
  pickMode,
  onTogglePickMode,
}: ReportFormProps) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!pickedPosition) {
      setMessage("Pick a point on the map first.");
      return;
    }

    setSubmitting(true);

    try {
      const { lat, lng } = pickedPosition;
      const locationName = formatMapPinLabel(lat, lng);

      const saved = await insertCommunityReport({
        location: locationName,
        issue_type: "no_power",
        time_reported: new Date().toISOString(),
        source: "user_report",
        description: description.trim() || null,
        latitude: lat,
        longitude: lng,
      });

      setDescription("");
      setMessage("Thank you — your pin stays on the map (even after refresh).");
      await onSuccess({ id: saved.id, lat, lng });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  const isSuccess = message?.includes("Thank you");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="field-label">Where is the outage?</p>
        <p className="mt-1 text-sm text-slate-500">
          Tap the button below, then tap the map to mark the spot.
        </p>
      </div>

      <button
        type="button"
        onClick={onTogglePickMode}
        className={`btn btn-outline btn-block ${pickMode ? "btn-outline-active" : ""}`}
      >
        <MapPinIcon />
        {pickMode ? "Tap the map to set pin" : "Pick location on map"}
      </button>

      {pickedPosition && (
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2.5 text-sm text-teal-800 ring-1 ring-teal-100">
          <MapPinIcon className="h-4 w-4 shrink-0" />
          Pin set — {formatMapPinLabel(pickedPosition.lat, pickedPosition.lng)}
        </div>
      )}

      <div>
        <label htmlFor="description" className="field-label">
          More details <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="When did it start? Any sounds or smells?"
          className="input resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !pickedPosition}
        className="btn btn-primary btn-block"
      >
        {submitting ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Sending…
          </>
        ) : (
          <>
            <PlusIcon />
            Submit report
          </>
        )}
      </button>

      {message && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            isSuccess
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
              : "bg-red-50 text-red-800 ring-1 ring-red-200"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
