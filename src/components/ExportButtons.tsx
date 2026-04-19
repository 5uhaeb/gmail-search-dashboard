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
        className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
        title="Export up to 800 matching messages (current filters) to CSV"
      >
        {busy === "csv" ? "Exporting…" : "Export CSV"}
      </button>
      <button
        type="button"
        onClick={() => doExport("json")}
        disabled={disabled || busy !== null}
        className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
        title="Export up to 800 matching messages (current filters) to JSON"
      >
        {busy === "json" ? "Exporting…" : "Export JSON"}
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
