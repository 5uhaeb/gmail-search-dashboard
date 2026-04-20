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
        <span className="font-medium text-ink-mute">Per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="input py-1 pl-2 pr-7 text-xs"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} disabled={disabled || !hasPrev} className="btn px-2.5 py-1 text-xs">
          <span aria-hidden="true">←</span>
          Prev
        </button>
        <span className="font-mono text-ink-mute tabular-nums">Page {page}</span>
        <button type="button" onClick={onNext} disabled={disabled || !hasNext} className="btn px-2.5 py-1 text-xs">
          Next
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
