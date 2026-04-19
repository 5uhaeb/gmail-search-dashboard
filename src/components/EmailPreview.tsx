"use client";

import { useEffect, useState } from "react";
import type { MessageDetail, ParsedMessage } from "@/types";
import { formatDateShort } from "@/lib/date-utils";

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

    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/gmail/message/${message.id}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? r.statusText);
        return r.json();
      })
      .then((d: MessageDetail) => setDetail(d))
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e.message || e));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="relative ml-auto w-full max-w-2xl h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        <header className="flex items-start gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold truncate">
              {message.subject || "(no subject)"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              <strong className="text-slate-700 dark:text-slate-300">{message.from.name || message.from.email}</strong>
              {message.from.name && <span> &lt;{message.from.email}&gt;</span>}
              <span className="mx-1.5">•</span>
              {formatDateShort(message.date)}
            </p>
            {message.to.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                to {message.to.map((t) => t.email).join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={message.gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Open in Gmail ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setShowHtml(true)}
            className={
              "px-2 py-1 rounded " +
              (showHtml ? "bg-brand-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800")
            }
          >
            HTML
          </button>
          <button
            type="button"
            onClick={() => setShowHtml(false)}
            className={
              "px-2 py-1 rounded " +
              (!showHtml ? "bg-brand-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800")
            }
          >
            Plain text
          </button>
          {showHtml && (
            <label className="ml-auto inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={showImages}
                onChange={(e) => setShowImages(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
              />
              Show remote images
            </label>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scroll-area">
          {loading && (
            <div className="p-8 text-sm text-slate-500 dark:text-slate-400">Loading message…</div>
          )}
          {error && (
            <div className="p-4 m-4 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded">
              {error}
            </div>
          )}
          {detail && !loading && !error && (
            <>
              {detail.attachments.length > 0 && (
                <div className="px-4 pt-3">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Attachments ({detail.attachments.length})
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {detail.attachments.map((a) => (
                      <li
                        key={a.attachmentId}
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        📎 <span className="truncate max-w-[16rem]">{a.filename}</span>
                        <span className="text-slate-400">({formatBytes(a.size)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="p-4">
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
                  <pre className="text-sm whitespace-pre-wrap break-words">{detail.bodyText}</pre>
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
