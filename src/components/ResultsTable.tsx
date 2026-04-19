"use client";

import type { ParsedMessage } from "@/types";
import { formatDateShort } from "@/lib/date-utils";

interface Props {
  messages: ParsedMessage[];
  sortOrder: "newest" | "oldest";
  onSortChange: (o: "newest" | "oldest") => void;
  onSelect: (m: ParsedMessage) => void;
  selectedId?: string | null;
  loading?: boolean;
}

export default function ResultsTable({
  messages,
  sortOrder,
  onSortChange,
  onSelect,
  selectedId,
  loading,
}: Props) {
  const sorted = [...messages].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return sortOrder === "newest" ? tb - ta : ta - tb;
  });

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="text-slate-500 dark:text-slate-400">
          {loading ? "Loading…" : `${messages.length} result${messages.length === 1 ? "" : "s"} on this page`}
        </div>
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <span>Sort:</span>
          <button
            type="button"
            onClick={() => onSortChange("newest")}
            className={
              "px-2 py-0.5 rounded " +
              (sortOrder === "newest"
                ? "bg-brand-600 text-white"
                : "hover:bg-slate-100 dark:hover:bg-slate-800")
            }
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => onSortChange("oldest")}
            className={
              "px-2 py-0.5 rounded " +
              (sortOrder === "oldest"
                ? "bg-brand-600 text-white"
                : "hover:bg-slate-100 dark:hover:bg-slate-800")
            }
          >
            Oldest
          </button>
        </div>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800 scroll-area max-h-[70vh] overflow-y-auto">
        {sorted.map((m) => (
          <li
            key={m.id}
            onClick={() => onSelect(m)}
            className={
              "px-3 py-2.5 text-sm cursor-pointer transition " +
              (selectedId === m.id
                ? "bg-brand-50 dark:bg-brand-900/30"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50") +
              (m.isUnread ? " font-medium" : "")
            }
          >
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0 " aria-hidden>
                <div
                  className={
                    "w-2 h-2 rounded-full " +
                    (m.isUnread ? "bg-brand-500" : "bg-transparent")
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="truncate text-slate-900 dark:text-slate-100">
                    {m.from.name || m.from.email || "(unknown sender)"}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {formatDateShort(m.date)}
                  </span>
                </div>
                <div className="truncate text-slate-800 dark:text-slate-200">
                  {m.subject || "(no subject)"}
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {m.snippet}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {m.hasAttachment && (
                    <Badge tone="slate">📎 {m.attachmentCount || ""}</Badge>
                  )}
                  {m.isStarred && <Badge tone="amber">★ Starred</Badge>}
                  {m.labelIds
                    .filter((l) => !["UNREAD", "STARRED", "INBOX", "IMPORTANT", "CATEGORY_PERSONAL", "HAS_ATTACHMENT"].includes(l))
                    .slice(0, 3)
                    .map((l) => (
                      <Badge key={l} tone="slate">
                        {l.replace(/^CATEGORY_/, "").toLowerCase()}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </li>
        ))}
        {!loading && sorted.length === 0 && (
          <li className="px-3 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No messages match your filters.
          </li>
        )}
      </ul>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "slate" | "amber";
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span className={"inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium " + cls}>
      {children}
    </span>
  );
}
