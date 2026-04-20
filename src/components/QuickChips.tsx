"use client";

import { QUICK_CHIPS } from "@/lib/query-builder";

const ACTIVE_CHIP_CLASSES = [
  "chip-yellow",
  "chip-blue",
  "chip-green",
  "chip-red",
  "chip-yellow",
  "chip-blue",
];

export default function QuickChips({
  onPick,
  activeKeyword,
}: {
  onPick: (keywords: string, label: string) => void;
  activeKeyword?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_CHIPS.map((chip, index) => {
        const active = activeKeyword === chip.keywords;
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => onPick(chip.keywords, chip.label)}
            className={active ? ACTIVE_CHIP_CLASSES[index % ACTIVE_CHIP_CLASSES.length] : "chip"}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
