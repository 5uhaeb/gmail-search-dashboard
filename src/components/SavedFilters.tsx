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
  refreshToken: number;   // bump to force refetch
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
      if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
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
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-1 px-2 pt-2">
        <TabBtn active={tab === "saved"} onClick={() => setTab("saved")}>
          Saved ({saved.length})
        </TabBtn>
        <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
          History ({history.length})
        </TabBtn>
      </div>

      {tab === "saved" && (
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this search…"
              className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") addSaved();
              }}
            />
            <button
              type="button"
              onClick={addSaved}
              disabled={!name.trim() || loading}
              className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm"
            >
              Save
            </button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto scroll-area -mx-3">
            {saved.map((s) => (
              <li
                key={s.id}
                className="group flex items-start gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <button
                  type="button"
                  onClick={() => onApply(s.filters)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {s.query || "(empty query)"}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => removeSaved(s.id)}
                  className="opacity-60 hover:opacity-100 text-xs text-red-600 dark:text-red-400"
                  title="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
            {saved.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No saved searches yet. Configure filters and save them for one-click reuse.
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "history" && (
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Your last 50 searches.</p>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              >
                Clear all
              </button>
            )}
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto scroll-area -mx-3">
            {history.map((h) => (
              <li
                key={h.id}
                className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <button
                  type="button"
                  onClick={() => onApply(h.filters)}
                  className="w-full text-left"
                >
                  <div className="text-xs font-mono truncate text-slate-700 dark:text-slate-300">
                    {h.query}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(h.createdAt).toLocaleString()} · ~{h.resultCnt} results
                  </div>
                </button>
              </li>
            ))}
            {history.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                History will appear here.
              </li>
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
        "px-3 py-1.5 text-xs font-medium rounded-t-md transition " +
        (active
          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100")
      }
    >
      {children}
    </button>
  );
}
