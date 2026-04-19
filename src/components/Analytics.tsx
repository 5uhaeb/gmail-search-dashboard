"use client";

import { useMemo } from "react";
import type { DomainAggregate, ParsedMessage } from "@/types";

interface Props {
  messages: ParsedMessage[];
  domains: DomainAggregate[];
  savedKeywords?: string[]; // raw keyword strings from saved searches
}

export default function Analytics({ messages, domains, savedKeywords = [] }: Props) {
  const maxDomain = domains[0]?.count ?? 1;

  const keywordCounts = useMemo(() => {
    if (savedKeywords.length === 0) return [];
    const lc = messages.map((m) =>
      (m.subject + " " + m.snippet + " " + m.from.email + " " + m.from.name).toLowerCase()
    );
    return savedKeywords
      .map((kw) => {
        const term = kw.trim().toLowerCase();
        if (!term) return { keyword: kw, count: 0 };
        const count = lc.filter((text) => text.includes(term)).length;
        return { keyword: kw, count };
      })
      .filter((k) => k.keyword)
      .sort((a, b) => b.count - a.count);
  }, [messages, savedKeywords]);

  if (messages.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Analytics (current page)
      </h3>

      <section>
        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
          Top sender domains
        </div>
        {domains.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No sender data.</p>
        ) : (
          <ul className="space-y-1.5">
            {domains.slice(0, 8).map((d: DomainAggregate) => (
              <li key={d.domain} className="flex items-center gap-2 text-xs">
                <span className="w-40 truncate text-slate-700 dark:text-slate-300">{d.domain}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${Math.max(4, (d.count / maxDomain) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums text-slate-500 dark:text-slate-400">
                  {d.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {keywordCounts.length > 0 && (
        <section>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
            Matches for saved keywords
          </div>
          <ul className="space-y-1">
            {keywordCounts.slice(0, 8).map((k) => (
              <li key={k.keyword} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-mono text-slate-700 dark:text-slate-300">{k.keyword}</span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">{k.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
