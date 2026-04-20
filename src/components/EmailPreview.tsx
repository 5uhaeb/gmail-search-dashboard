"use client";

import { useEffect, useState } from "react";
import type { MessageDetail, ParsedMessage } from "@/types";
import { formatDateShort } from "@/lib/date-utils";
import { Checkbox } from "@/components/FilterPanel";

const PREVIEW_CACHE_LIMIT = 50;
const previewCache = new Map<string, MessageDetail>();

function getCachedPreview(id: string): MessageDetail | null {
  const cached = previewCache.get(id);
  if (!cached) return null;
  previewCache.delete(id);
  previewCache.set(id, cached);
  return cached;
}

function setCachedPreview(id: string, detail: MessageDetail) {
  if (previewCache.has(id)) previewCache.delete(id);
  previewCache.set(id, detail);
  while (previewCache.size > PREVIEW_CACHE_LIMIT) {
    const oldestKey = previewCache.keys().next().value;
    if (!oldestKey) break;
    previewCache.delete(oldestKey);
  }
}

export default function EmailPreview({
  message,
  onClose,
}: {
  message: ParsedMessage | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImages, setShowImages] = useState(false);
  const [showHtml, setShowHtml] = useState(true);

  useEffect(() => {
    setDetail(null);
    setError(null);
    setShowImages(false);
    if (!message) return;

    const cached = getCachedPreview(message.id);
    if (cached) {
      setDetail(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/gmail/message/${message.id}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? r.statusText);
        return r.json();
      })
      .then((d: MessageDetail) => {
        setCachedPreview(message.id, d);
        setDetail(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e.message || e));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <aside className="relative ml-auto flex h-full w-full max-w-2xl flex-col border-l-cartoon border-ink bg-surface text-ink shadow-cartoon">
        <header className="flex items-start gap-3 border-b-cartoon-thin border-ink px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">{message.subject || "(no subject)"}</h2>
            <p className="truncate text-xs text-ink-mute">
              <strong className="text-ink">{message.from.name || message.from.email}</strong>
              {message.from.name && <span> &lt;{message.from.email}&gt;</span>}
              <span className="mx-1.5">/</span>
              {formatDateShort(message.date)}
            </p>
            {message.to.length > 0 && (
              <p className="truncate text-xs text-ink-mute">
                to {message.to.map((t) => t.email).join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href={message.gmailUrl} target="_blank" rel="noopener noreferrer" className="btn px-2 py-1 text-xs">
              Open in Gmail
              <ExternalIcon />
            </a>
            <button type="button" onClick={onClose} className="btn h-8 w-8 p-0" aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b-cartoon-thin border-ink px-4 py-2 text-xs">
          <button type="button" onClick={() => setShowHtml(true)} className={showHtml ? "chip-blue" : "chip"}>
            HTML
          </button>
          <button type="button" onClick={() => setShowHtml(false)} className={!showHtml ? "chip-blue" : "chip"}>
            Plain text
          </button>
          {showHtml && (
            <div className="ml-auto">
              <Checkbox label="Show remote images" checked={showImages} onChange={setShowImages} />
            </div>
          )}
        </div>

        <div className="scroll-area flex-1 overflow-y-auto">
          {loading && <div className="p-8 text-sm font-medium text-ink-mute">Loading message...</div>}
          {error && <div className="card-sm m-4 border-accent-red bg-[#ffecec] p-4 text-sm font-semibold text-accent-red dark:bg-[#3a1f1f]">{error}</div>}
          {detail && !loading && !error && (
            <>
              {detail.attachments.length > 0 && (
                <div className="px-4 pt-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                    Attachments ({detail.attachments.length})
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {detail.attachments.map((a) => (
                      <li key={a.attachmentId} className="chip max-w-full">
                        <PaperclipIcon />
                        <span className="max-w-[16rem] truncate">{a.filename}</span>
                        <span className="text-ink-mute">({formatBytes(a.size)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="p-5">
                {showHtml ? (
                  <div
                    className="email-body"
                    // detail.bodyHtml is sanitized server-side with DOMPurify.
                    // When images are blocked, remote URLs are stashed in data-src;
                    // we swap them back into src only when the user opts in.
                    dangerouslySetInnerHTML={{
                      __html: showImages
                        ? detail.bodyHtml
                            .replace(/\sdata-src=/g, " src=")
                            .replace(/\sdata-blocked="1"/g, "")
                            .replace(/alt="\[image blocked\]"/g, "")
                        : detail.bodyHtml,
                    }}
                  />
                ) : (
                  <pre className="font-mono text-sm whitespace-pre-wrap break-words">{detail.bodyText}</pre>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function ExternalIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-8 8M19 14v5H5V5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m8 12.5 6.8-6.8a4 4 0 0 1 5.7 5.7l-8.7 8.7a6 6 0 0 1-8.5-8.5l8.2-8.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
