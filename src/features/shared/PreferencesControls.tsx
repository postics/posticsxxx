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
  document.documentElement.setAttribute("data-theme", t);
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
        "grid size-9 place-items-center rounded-lg border border-line bg-surface text-ink-700 transition-all hover:border-ink-700/30 hover:text-ink-900 active:scale-[0.95] active:bg-surface-sunken",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} />
    </button>
  );
}

/* ─────────────── Language ─────────────── */

const LANG_KEY = "postics:lang";

export const LANGUAGES: { code: string; name: string; cc: string }[] = [
  { code: "am", name: "አማርኛ", cc: "et" },
  { code: "ar", name: "العربية", cc: "sa" },
  { code: "bg", name: "Български", cc: "bg" },
  { code: "bn", name: "বাংলা", cc: "bd" },
  { code: "cs", name: "Čeština", cc: "cz" },
  { code: "de", name: "Deutsch", cc: "de" },
  { code: "el", name: "Ελληνικά", cc: "gr" },
  { code: "en", name: "English", cc: "gb" },
  { code: "es", name: "Español", cc: "es" },
  { code: "fa", name: "فارسی", cc: "ir" },
  { code: "fi", name: "Suomi", cc: "fi" },
  { code: "fr", name: "Français", cc: "fr" },
  { code: "ha", name: "Hausa", cc: "ng" },
  { code: "he", name: "עברית", cc: "il" },
  { code: "hi", name: "हिन्दी", cc: "in" },
  { code: "hu", name: "Magyar", cc: "hu" },
  { code: "id", name: "Bahasa Indonesia", cc: "id" },
  { code: "it", name: "Italiano", cc: "it" },
  { code: "ja", name: "日本語", cc: "jp" },
  { code: "ka", name: "ქართული", cc: "ge" },
  { code: "kk", name: "Қазақша", cc: "kz" },
  { code: "ko", name: "한국어", cc: "kr" },
  { code: "lv", name: "Latviešu", cc: "lv" },
  { code: "nl", name: "Nederlands", cc: "nl" },
  { code: "no", name: "Norsk", cc: "no" },
  { code: "pl", name: "Polski", cc: "pl" },
  { code: "pt", name: "Português", cc: "pt" },
  { code: "ro", name: "Română", cc: "ro" },
  { code: "ru", name: "Русский", cc: "ru" },
  { code: "si", name: "සිංහල", cc: "lk" },
  { code: "sk", name: "Slovenčina", cc: "sk" },
  { code: "sr", name: "Српски", cc: "rs" },
  { code: "sv", name: "Svenska", cc: "se" },
  { code: "sw", name: "Kiswahili", cc: "ke" },
  { code: "th", name: "ไทย", cc: "th" },
  { code: "tl", name: "Filipino", cc: "ph" },
  { code: "tr", name: "Türkçe", cc: "tr" },
  { code: "uk", name: "Українська", cc: "ua" },
  { code: "ur", name: "اردو", cc: "pk" },
  { code: "uz", name: "O'zbek", cc: "uz" },
  { code: "vi", name: "Tiếng Việt", cc: "vn" },
  { code: "zh", name: "中文", cc: "cn" },
];

export function Flag({ cc, className }: { cc: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      width={20}
      height={15}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={cn(
        "inline-block h-[15px] w-[20px] shrink-0 rounded-[2px] object-cover ring-1 ring-black/10",
        className,
      )}
    />
  );
}

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
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-sm font-medium uppercase tracking-wider text-ink-700 transition-all hover:border-ink-700/30 hover:text-ink-900 active:scale-[0.97] active:bg-surface-sunken",
          compact && "px-2",
        )}
      >
        <Flag cc={current.cc} />
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
                <Flag cc={l.cc} />
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