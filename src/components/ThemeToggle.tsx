"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    if (typeof window === "undefined") return;
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const cycle = () => {
    applyTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="btn px-2.5 py-1.5 text-xs"
      title={`Theme: ${theme} (click to toggle)`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
      <span className="hidden capitalize sm:inline">{theme}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 15.5A8.2 8.2 0 0 1 8.5 4 8.7 8.7 0 1 0 20 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
