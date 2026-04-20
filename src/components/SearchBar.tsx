"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, onSubmit, onClear, loading }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-stretch gap-2"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search your inbox - keywords, or try from:alice subject:invoice"
          className="input w-full py-3 pl-10 pr-20 text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="chip absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px]"
          >
            Clear
          </button>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-5 py-3">
        {loading ? (
          <>
            <Spinner /> Searching...
          </>
        ) : (
          "Search"
        )}
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
