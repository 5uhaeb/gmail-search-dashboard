"use client";

interface Props {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  page,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  pageSize,
  onPageSizeChange,
  disabled,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 dark:text-slate-400">Per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || !hasPrev}
          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-slate-500 dark:text-slate-400 tabular-nums">Page {page}</span>
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || !hasNext}
          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
