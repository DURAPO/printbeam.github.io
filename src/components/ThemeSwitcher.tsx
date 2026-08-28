import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const options = [
  { value: "light" as const, icon: Sun, label: "Light mode" },
  { value: "dark" as const, icon: Moon, label: "Dark mode" },
  { value: "system" as const, icon: Monitor, label: "System default" },
];

interface ThemeSwitcherProps {
  variant?: "inline" | "dropdown";
}

export default function ThemeSwitcher({ variant = "inline" }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (variant === "inline") {
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Theme switcher"
        className="inline-flex items-center rounded-lg border border-border bg-card p-0.5"
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={theme === opt.value}
            aria-label={opt.label}
            onClick={() => setTheme(opt.value)}
            className={`relative flex size-8 items-center justify-center rounded-md transition-all duration-200 ${
              theme === opt.value
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <opt.icon className="size-3.5" />
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  const current = options.find((o) => o.value === theme) || options[2];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change theme"
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <current.icon className="size-3.5" />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Theme options"
          className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border border-border bg-card shadow-lg p-1 animate-in fade-in-0 zoom-in-95"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={theme === opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors ${
                theme === opt.value
                  ? "bg-foreground/5 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
