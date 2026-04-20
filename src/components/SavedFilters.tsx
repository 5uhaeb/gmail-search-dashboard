"use client";

import { useEffect, useState } from "react";
import type { SearchFilters } from "@/types";

interface SavedSearchRow {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

interface HistoryRow {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCnt: number;
  createdAt: string;
}

interface Props {
  currentFilters: SearchFilters;
  currentQuery: string;
  onApply: (f: SearchFilters) => void;
  refreshToken: number;
}

export default function SavedFilters({
  currentFilters,
  currentQuery,
  onApply,
  refreshToken,
}: Props) {
  const [tab, setTab] = useState<"saved" | "history">("saved");
  const [saved, setSaved] = useState<SavedSearchRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSaved = async () => {
    try {
      const r = await fetch("/api/saved-searches");
      if (r.ok) setSaved(await r.json());
    } catch (e) {
      console.error(e);
    }
  };
  const loadHistory = async () => {
    try {
      const r = await fetch("/api/history");
      if (r.ok) setHistory(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSaved();
    loadHistory();
  }, [refreshToken]);

  const addSaved = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          query: currentQuery,
          filters: currentFilters,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => null);
        throw new Error(body?.error ?? r.statusText ?? "Could not save this search.");
      }
      setName("");
      await loadSaved();
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (id: string) => {
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    await loadSaved();
  };

  const clearHistory = async () => {
    await fetch(`/api/history`, { method: "DELETE" });
    await loadHistory();
  };

  return (
    <div className="card p-3">
      <div className="mb-3 flex items-center gap-3 border-b-cartoon-thin border-ink">
        <TabBtn active={tab === "saved"} onClick={() => setTab("saved")}>
          Saved ({saved.length})
        </TabBtn>
        <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
          History ({history.length})
        </TabBtn>
      </div>

      {tab === "saved" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this search..."
              className="input min-w-0 flex-1 py-1.5 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") addSaved();
              }}
            />
            <button
              type="button"
              onClick={addSaved}
              disabled={!name.trim() || loading}
              className="btn-primary px-3 py-1.5 text-sm"
            >
              Save
            </button>
          </div>
          {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
          <ul className="scroll-area max-h-80 space-y-2 overflow-y-auto pr-1">
            {saved.map((s) => (
              <li key={s.id} className="row-item flex items-start gap-2 p-2">
                <button type="button" onClick={() => onApply(s.filters)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="truncate font-mono text-xs text-ink-mute">{s.query || "(empty query)"}</div>
                </button>
                <button
                  type="button"
                  onClick={() => removeSaved(s.id)}
                  className="btn h-7 w-7 rounded-full p-0 text-accent-red"
                  title="Delete"
                  aria-label="Delete saved search"
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
            {saved.length === 0 && (
              <li className="panel px-3 py-8 text-center text-xs text-ink-mute">
                <FolderIcon />
                <p className="mt-2 font-semibold">No saved searches yet</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-mute">Your last 50 searches.</p>
            {history.length > 0 && (
              <button type="button" onClick={clearHistory} className="chip text-accent-red">
                Clear all
              </button>
            )}
          </div>
          <ul className="scroll-area max-h-80 space-y-2 overflow-y-auto pr-1">
            {history.map((h) => (
              <li key={h.id} className="row-item p-2">
                <button type="button" onClick={() => onApply(h.filters)} className="w-full text-left">
                  <div className="truncate font-mono text-xs text-ink">{h.query}</div>
                  <div className="mt-0.5 text-[10px] text-ink-mute">
                    {new Date(h.createdAt).toLocaleString()} / ~{h.resultCnt} results
                  </div>
                </button>
              </li>
            ))}
            {history.length === 0 && (
              <li className="panel px-3 py-6 text-center text-xs font-medium text-ink-mute">History will appear here.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "border-b-[3px] px-1 pb-2 text-xs transition " +
        (active
          ? "border-accent-red font-semibold text-ink"
          : "border-transparent font-medium text-ink-mute hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="mx-auto h-14 w-14 text-ink" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M8 18h18l5 6h25v28H8V18Z" fill="var(--surface-2)" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M8 28h48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
