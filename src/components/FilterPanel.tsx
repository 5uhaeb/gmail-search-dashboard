"use client";

import type { SearchFilters, DateRangePreset } from "@/types";

const DATE_OPTIONS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom range..." },
];

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function FilterPanel({ filters, onChange }: Props) {
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) => {
    onChange({ ...filters, [k]: v });
  };

  return (
    <div className="panel space-y-4 p-4">
      <h2 className="text-sm font-semibold">Advanced Filters</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="From">
          <input
            type="text"
            value={filters.from ?? ""}
            onChange={(e) => set("from", e.target.value)}
            placeholder="sender@example.com"
            className="input w-full"
          />
        </Field>
        <Field label="To">
          <input
            type="text"
            value={filters.to ?? ""}
            onChange={(e) => set("to", e.target.value)}
            placeholder="recipient@example.com"
            className="input w-full"
          />
        </Field>
        <Field label="Subject">
          <input
            type="text"
            value={filters.subject ?? ""}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Subject contains..."
            className="input w-full"
          />
        </Field>
        <Field label="Label">
          <input
            type="text"
            value={filters.label ?? ""}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Important, work, starred"
            className="input w-full"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Date range">
          <select
            value={filters.datePreset ?? "any"}
            onChange={(e) => set("datePreset", e.target.value as DateRangePreset)}
            className="select w-full"
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="View mode">
          <select
            value={filters.viewMode ?? "messages"}
            onChange={(e) => set("viewMode", e.target.value as "messages" | "threads")}
            className="select w-full"
          >
            <option value="messages">Messages</option>
            <option value="threads">Threads</option>
          </select>
        </Field>
      </div>

      {filters.datePreset === "custom" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="After">
            <input
              type="date"
              value={filters.customAfter ?? ""}
              onChange={(e) => set("customAfter", e.target.value)}
              className="input w-full"
            />
          </Field>
          <Field label="Before">
            <input
              type="date"
              value={filters.customBefore ?? ""}
              onChange={(e) => set("customBefore", e.target.value)}
              className="input w-full"
            />
          </Field>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
        <Checkbox label="Has attachment" checked={!!filters.hasAttachment} onChange={(v) => set("hasAttachment", v)} />
        <Checkbox label="Starred" checked={!!filters.isStarred} onChange={(v) => set("isStarred", v)} />
        <Checkbox
          label="Unread only"
          checked={!!filters.isUnread}
          onChange={(v) => {
            onChange({ ...filters, isUnread: v, isRead: v ? false : filters.isRead });
          }}
        />
        <Checkbox
          label="Read only"
          checked={!!filters.isRead}
          onChange={(v) => {
            onChange({ ...filters, isRead: v, isUnread: v ? false : filters.isUnread });
          }}
        />
      </div>

      <Field label="Advanced raw Gmail query">
        <input
          type="text"
          value={filters.rawQuery ?? ""}
          onChange={(e) => set("rawQuery", e.target.value)}
          placeholder='e.g. category:promotions -"unsubscribe"'
          className="input w-full font-mono"
        />
      </Field>
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="checkbox peer-checked:bg-accent-yellow">
        {checked && <CheckIcon />}
      </span>
      <span className="font-medium">{label}</span>
    </label>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.2 6.3 11 13 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
