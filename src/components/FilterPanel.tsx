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
  { value: "custom", label: "Custom range…" },
];

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

export default function FilterPanel({ filters, onChange }: Props) {
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) => {
    onChange({ ...filters, [k]: v });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="From">
          <input
            type="text"
            value={filters.from ?? ""}
            onChange={(e) => set("from", e.target.value)}
            placeholder="sender@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="To">
          <input
            type="text"
            value={filters.to ?? ""}
            onChange={(e) => set("to", e.target.value)}
            placeholder="recipient@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="Subject">
          <input
            type="text"
            value={filters.subject ?? ""}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Subject contains…"
            className={inputCls}
          />
        </Field>
        <Field label="Label">
          <input
            type="text"
            value={filters.label ?? ""}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Important, work, starred"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Date range">
          <select
            value={filters.datePreset ?? "any"}
            onChange={(e) => set("datePreset", e.target.value as DateRangePreset)}
            className={inputCls}
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="View mode">
          <select
            value={filters.viewMode ?? "messages"}
            onChange={(e) => set("viewMode", e.target.value as "messages" | "threads")}
            className={inputCls}
          >
            <option value="messages">Messages</option>
            <option value="threads">Threads</option>
          </select>
        </Field>
      </div>

      {filters.datePreset === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="After (YYYY-MM-DD)">
            <input
              type="date"
              value={filters.customAfter ?? ""}
              onChange={(e) => set("customAfter", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Before (YYYY-MM-DD, inclusive)">
            <input
              type="date"
              value={filters.customBefore ?? ""}
              onChange={(e) => set("customBefore", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Checkbox
          label="Has attachment"
          checked={!!filters.hasAttachment}
          onChange={(v) => set("hasAttachment", v)}
        />
        <Checkbox
          label="Starred"
          checked={!!filters.isStarred}
          onChange={(v) => set("isStarred", v)}
        />
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

      <Field label="Advanced: raw Gmail query (merged with above)">
        <input
          type="text"
          value={filters.rawQuery ?? ""}
          onChange={(e) => set("rawQuery", e.target.value)}
          placeholder='e.g. category:promotions -"unsubscribe"'
          className={inputCls + " font-mono"}
        />
      </Field>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 select-none cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}
