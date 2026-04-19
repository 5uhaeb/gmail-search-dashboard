"use client";

import { QUICK_CHIPS } from "@/lib/query-builder";

export default function QuickChips({
  onPick,
  activeKeyword,
}: {
  onPick: (keywords: string, label: string) => void;
  activeKeyword?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK_CHIPS.map((chip) => {
        const active = activeKeyword === chip.keywords;
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => onPick(chip.keywords, chip.label)}
            className={
              "px-2.5 py-1 text-xs rounded-full border transition " +
              (active
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")
            }
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
