export type ThemePalette = "navy" | "emerald" | "sapphire" | "slate";

export interface ThemeOption {
  id: ThemePalette;
  name: string;
  previewColor: string;
  accentColor: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "navy",
    name: "Corporate Navy",
    previewColor: "#0f2747",
    accentColor: "#2563eb",
    description: "Paleta institucional bancaria clásica de alta confianza.",
  },
  {
    id: "emerald",
    name: "Private Emerald",
    previewColor: "#064e3b",
    accentColor: "#10b981",
    description: "Paleta de banca privada y finanzas sostenibles ESG.",
  },
  {
    id: "sapphire",
    name: "Fintech Sapphire",
    previewColor: "#1e3a8a",
    accentColor: "#3b82f6",
    description: "Paleta digital contemporánea y dinámica.",
  },
  {
    id: "slate",
    name: "Midnight Slate",
    previewColor: "#090d16",
    accentColor: "#38bdf8",
    description: "Paleta ejecutiva oscura de alto contraste.",
  },
];

const THEME_STORAGE_KEY = "aegisbank_color_theme";

export function getActiveTheme(): ThemePalette {
  if (typeof window === "undefined") return "navy";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePalette;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore quota/security errors
  }
  return "navy";
}

export function applyTheme(theme: ThemePalette): void {
  if (typeof document === "undefined") return;
  if (theme === "navy") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore
  }
}

export function initTheme(): ThemePalette {
  const active = getActiveTheme();
  applyTheme(active);
  return active;
}
