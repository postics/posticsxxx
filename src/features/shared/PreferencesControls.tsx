import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Moon, Sun, Globe, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────── Theme ─────────────── */

type Theme = "light" | "dark";
const THEME_KEY = "postics:theme";

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(THEME_KEY)) as Theme | null;
    const initial: Theme = saved === "dark" || saved === "light"
      ? saved
      : (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);
  const set = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    if (typeof window !== "undefined") window.localStorage.setItem(THEME_KEY, t);
  };
  return [theme, set];
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "grid size-9 place-items-center rounded-lg border border-line bg-surface text-ink-700 transition-colors hover:border-ink-700/30 hover:text-ink-900",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} />
    </button>
  );
}

/* ─────────────── Language ─────────────── */

const LANG_KEY = "postics:lang";

export const LANGUAGES: { code: string; name: string; flag: string }[] = [
  { code: "am", name: "አማርኛ", flag: "🇪🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "bg", name: "Български", flag: "🇧🇬" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ka", name: "ქართული", flag: "🇬🇪" },
  { code: "kk", name: "Қазақша", flag: "🇰🇿" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "lv", name: "Latviešu", flag: "🇱🇻" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "si", name: "සිංහල", flag: "🇱🇰" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "sr", name: "Српски", flag: "🇷🇸" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "tl", name: "Filipino", flag: "🇵🇭" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "uz", name: "O'zbek", flag: "🇺🇿" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function useLanguage(): [string, (c: string) => void] {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved) setLang(saved);
  }, []);
  const set = (c: string) => {
    setLang(c);
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, c);
  };
  return [lang, set];
}

export function LanguageButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [lang] = useLanguage();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[7];
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Select language"
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg border border-line bg-surface px-3 text-sm font-medium uppercase tracking-wider text-ink-700 transition-colors hover:border-ink-700/30 hover:text-ink-900",
          compact && "px-2",
        )}
      >
        {current.code}
      </button>
      {open && <LanguageDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function LanguageDialog({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select language"
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-ink-900/60 px-4 py-12 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] animate-rise"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Globe className="size-4 text-brand-700" strokeWidth={1.5} />
            <h2 className="font-display text-lg text-ink-900">Select Language</h2>
            <span className="font-mono-num rounded-md bg-surface-sunken px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {LANGUAGES.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface-sunken hover:text-ink-900"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="grid max-h-[70vh] gap-2 overflow-y-auto p-5 sm:grid-cols-2 md:grid-cols-3">
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  onClose();
                }}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "border-brand-700 bg-brand-100 text-brand-700"
                    : "border-line bg-surface text-ink-700 hover:border-brand-700/40 hover:bg-surface-sunken",
                )}
              >
                <span className="text-lg leading-none">{l.flag}</span>
                <span className="flex-1 truncate">{l.name}</span>
                {active && <Check className="size-3.5 text-brand-700" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}