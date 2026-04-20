"use client";

import { useState } from "react";
import type { SearchFilters } from "@/types";

export default function ExportButtons({
  filters,
  disabled,
}: {
  filters: SearchFilters;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<"csv" | "json" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doExport = async (format: "csv" | "json") => {
    setBusy(format);
    setError(null);
    try {
      const r = await fetch("/api/gmail/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, format }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? r.statusText);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "csv" ? "csv" : "json";
      a.download = `gmail-export-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => doExport("csv")}
        disabled={disabled || busy !== null}
        className="btn px-2.5 py-1.5 text-[13px]"
        title="Export up to 800 matching messages (current filters) to CSV"
      >
        {busy === "csv" ? <Spinner /> : "Export CSV"}
      </button>
      <button
        type="button"
        onClick={() => doExport("json")}
        disabled={disabled || busy !== null}
        className="btn px-2.5 py-1.5 text-[13px]"
        title="Export up to 800 matching messages (current filters) to JSON"
      >
        {busy === "json" ? <Spinner /> : "Export JSON"}
      </button>
      {error && <span className="text-xs font-semibold text-accent-red">{error}</span>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
