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
  const showSkeletons = loading && sorted.length === 0;
  const showRefreshing = loading && sorted.length > 0;

  return (
    <div className="card relative border-cartoon-thin p-3">
      {showRefreshing && (
        <div className="chip-blue absolute right-3 top-3 z-10 px-2 py-1 text-[10px]">
          <SpinnerIcon />
          Refreshing
        </div>
      )}
      <div className="mb-3 flex items-center justify-between gap-3 text-xs">
        <div className="font-medium text-ink-mute">
          {loading ? "Loading..." : `${messages.length} result${messages.length === 1 ? "" : "s"} on this page`}
        </div>
        <div className="flex items-center gap-1 text-ink">
          <span className="font-semibold text-ink-mute">Sort:</span>
          <button
            type="button"
            onClick={() => onSortChange("newest")}
            className={sortOrder === "newest" ? "chip-yellow" : "chip"}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => onSortChange("oldest")}
            className={sortOrder === "oldest" ? "chip-yellow" : "chip"}
          >
            Oldest
          </button>
        </div>
      </div>

      <ul className={"scroll-area max-h-[70vh] space-y-2 overflow-y-auto pr-1 " + (showRefreshing ? "opacity-55" : "")}>
        {showSkeletons &&
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        {sorted.map((m) => (
          <li
            key={m.id}
            onClick={() => onSelect(m)}
            className={
              "row-item cursor-pointer " +
              (selectedId === m.id ? "bg-surface-2" : "") +
              (m.isUnread ? " font-medium" : "")
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-cartoon-thin border-ink " +
                  (m.isUnread ? "bg-accent-red" : "bg-surface")
                }
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-sm font-semibold text-ink">
                    {m.from.name || m.from.email || "(unknown sender)"}
                  </span>
                  <span className="ml-auto shrink-0 text-xs font-medium text-ink-mute">
                    {formatDateShort(m.date)}
                  </span>
                </div>
                <div className="truncate text-sm font-medium text-ink">{m.subject || "(no subject)"}</div>
                <div className="mt-0.5 truncate text-xs text-ink-mute">{m.snippet}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {m.hasAttachment && (
                    <Badge tone="plain">
                      <PaperclipIcon />
                      {m.attachmentCount || ""}
                    </Badge>
                  )}
                  {m.isStarred && (
                    <Badge tone="yellow">
                      <StarIcon />
                      Starred
                    </Badge>
                  )}
                  {m.labelIds
                    .filter((l) => !["UNREAD", "STARRED", "INBOX", "IMPORTANT", "CATEGORY_PERSONAL", "HAS_ATTACHMENT"].includes(l))
                    .slice(0, 3)
                    .map((l) => (
                      <Badge key={l} tone="yellow">
                        {l.replace(/^CATEGORY_/, "").toLowerCase()}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </li>
        ))}
        {!loading && sorted.length === 0 && (
          <li className="panel px-3 py-10 text-center text-sm font-medium text-ink-mute">
            No messages match your filters.
          </li>
        )}
      </ul>
    </div>
  );
}

function SkeletonRow() {
  return (
    <li className="row-item min-h-[112px]">
      <div className="flex items-start gap-3">
        <div className="skeleton-shimmer mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-cartoon-thin border-ink" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="skeleton-shimmer h-4 w-40 rounded-[6px]" />
            <div className="ml-auto skeleton-shimmer h-3 w-24 rounded-[6px]" />
          </div>
          <div className="skeleton-shimmer h-4 w-3/5 rounded-[6px]" />
          <div className="skeleton-shimmer h-3 w-11/12 rounded-[6px]" />
          <div className="skeleton-shimmer h-5 w-16 rounded-full" />
        </div>
      </div>
    </li>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "plain" | "yellow";
}) {
  return <span className={tone === "yellow" ? "chip-yellow px-2 py-0.5 text-[10px]" : "chip px-2 py-0.5 text-[10px]"}>{children}</span>;
}

function PaperclipIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m8 12.5 6.8-6.8a4 4 0 0 1 5.7 5.7l-8.7 8.7a6 6 0 0 1-8.5-8.5l8.2-8.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
