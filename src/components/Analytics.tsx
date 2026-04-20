"use client";

import { useMemo } from "react";
import type { DomainAggregate, ParsedMessage } from "@/types";

interface Props {
  messages: ParsedMessage[];
  domains: DomainAggregate[];
  savedKeywords?: string[];
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
    <div className="card space-y-4 p-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">Analytics</h3>

      <section>
        <div className="mb-2 text-xs font-semibold text-ink">Top sender domains</div>
        {domains.length === 0 ? (
          <p className="text-xs text-ink-mute">No sender data.</p>
        ) : (
          <ul className="space-y-2">
            {domains.slice(0, 8).map((d: DomainAggregate, index) => (
              <li key={d.domain} className="text-xs">
                <div className="mb-1 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium text-ink">{d.domain}</span>
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-ink-mute">{d.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full border-cartoon-thin border-ink bg-surface-2">
                  <div
                    className={"h-full " + barColor(index)}
                    style={{ width: `${Math.max(4, (d.count / maxDomain) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {keywordCounts.length > 0 && (
        <section>
          <div className="mb-2 text-xs font-semibold text-ink">Matches for saved keywords</div>
          <ul className="space-y-1">
            {keywordCounts.slice(0, 8).map((k) => (
              <li key={k.keyword} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-mono text-ink">{k.keyword}</span>
                <span className="font-mono font-semibold tabular-nums text-ink-mute">{k.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function barColor(index: number) {
  if (index === 1) return "bg-accent-yellow";
  if (index === 2) return "bg-accent-red";
  return "bg-accent-blue";
}
