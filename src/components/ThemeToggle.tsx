"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    if (typeof window === "undefined") return;
    localStorage.setItem("theme", t);
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = t === "dark" || (t === "system" && sysDark);
    document.documentElement.classList.toggle("dark", useDark);
  };

  const cycle = () => {
    applyTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      title={`Theme: ${theme} (click to cycle)`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🖥️"}
      <span className="hidden sm:inline capitalize">{theme}</span>
    </button>
  );
}
