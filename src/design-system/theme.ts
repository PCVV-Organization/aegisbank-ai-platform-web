/**
 * AegisBank Theme Architecture & Orchestration
 *
 * Provides centralized configuration to manage and switch the banking theme.
 * When a developer wants to change the default bank theme or introduce a new corporate identity,
 * they only need to change THEME_CONFIG.activeTheme or call applyTheme(paletteId).
 */

import { BANK_PALETTES, type BankPaletteDefinition } from "./tokens";

export type ThemePaletteId = "navy" | "emerald" | "sapphire" | "slate";

export interface ThemeConfig {
  /**
   * The active bank theme ID.
   * To change the theme of the entire application, change this value.
   */
  defaultTheme: ThemePaletteId;
  /** Storage key used when preserving an authorized environment theme */
  storageKey: string;
}

export const THEME_CONFIG: ThemeConfig = {
  defaultTheme: "navy",
  storageKey: "aegisbank_color_theme",
};

export interface ThemeMetadata {
  id: ThemePaletteId;
  name: string;
  code: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const THEME_METADATA_LIST: ThemeMetadata[] = Object.values(
  BANK_PALETTES,
).map((p) => ({
  id: p.id as ThemePaletteId,
  name: p.name,
  code: p.code,
  description: p.description,
  primaryColor: p.primary.DEFAULT,
  secondaryColor: p.secondary.DEFAULT,
  accentColor: p.accent.DEFAULT,
}));

/**
 * Backward-compatible alias for previous theme options
 */
export const THEME_OPTIONS = THEME_METADATA_LIST.map((m) => ({
  id: m.id,
  name: m.name,
  previewColor: m.primaryColor,
  accentColor: m.accentColor,
  description: m.description,
}));

export function getActiveTheme(): ThemePaletteId {
  if (typeof window === "undefined") return THEME_CONFIG.defaultTheme;
  try {
    const saved = localStorage.getItem(
      THEME_CONFIG.storageKey,
    ) as ThemePaletteId;
    if (saved && saved in BANK_PALETTES) {
      return saved;
    }
  } catch {
    // Ignore localStorage access restrictions
  }
  return THEME_CONFIG.defaultTheme;
}

/**
 * Injects all CSS custom properties for the selected palette into the document root.
 * This guarantees atomic updates across Primary, Secondary, Accent, Sidebar, and Financial tokens.
 */
export function applyTheme(themeId: ThemePaletteId): void {
  if (typeof document === "undefined") return;

  const palette: BankPaletteDefinition | undefined = BANK_PALETTES[themeId];
  if (!palette) return;

  const root = document.documentElement;

  // Set the data-theme attribute on <html>
  if (themeId === "navy") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", themeId);
  }

  // 1. PRIMARY ROLE
  root.style.setProperty("--primary", palette.primary.DEFAULT);
  root.style.setProperty("--primary-hover", palette.primary.hover);
  root.style.setProperty("--primary-active", palette.primary.active);
  root.style.setProperty("--primary-foreground", palette.primary.foreground);
  if (palette.primary.subtle) {
    root.style.setProperty("--primary-subtle", palette.primary.subtle);
  }

  // 2. SECONDARY ROLE & SURFACES
  root.style.setProperty("--secondary", palette.secondary.DEFAULT);
  root.style.setProperty("--secondary-hover", palette.secondary.hover);
  root.style.setProperty("--secondary-active", palette.secondary.active);
  root.style.setProperty(
    "--secondary-foreground",
    palette.secondary.foreground,
  );
  if (palette.secondary.border) {
    root.style.setProperty("--secondary-border", palette.secondary.border);
  }

  // 3. ACCENT & INTERACTIVE ROLE
  root.style.setProperty("--accent", palette.accent.DEFAULT);
  root.style.setProperty("--accent-hover", palette.accent.hover);
  root.style.setProperty("--accent-foreground", palette.accent.foreground);
  root.style.setProperty("--ring", palette.accent.ring);
  root.style.setProperty("--accent-subtle", palette.accent.subtle);

  // 4. SIDEBAR ROLE
  root.style.setProperty("--sidebar-bg", palette.sidebar.bg);
  root.style.setProperty("--sidebar-fg", palette.sidebar.fg);
  root.style.setProperty("--sidebar-muted", palette.sidebar.muted);
  root.style.setProperty("--sidebar-border", palette.sidebar.border);
  root.style.setProperty("--sidebar-hover", palette.sidebar.hover);
  root.style.setProperty("--sidebar-active", palette.sidebar.active);
  root.style.setProperty(
    "--sidebar-active-border",
    palette.sidebar.activeBorder,
  );

  // 5. FINANCIAL SEMANTICS (banking-ui-ux)
  root.style.setProperty(
    "--financial-positive",
    palette.financial.positive.DEFAULT,
  );
  root.style.setProperty(
    "--financial-positive-fg",
    palette.financial.positive.foreground,
  );
  root.style.setProperty(
    "--financial-positive-bg",
    palette.financial.positive.subtle,
  );
  root.style.setProperty(
    "--financial-positive-border",
    palette.financial.positive.border,
  );

  root.style.setProperty(
    "--financial-pending",
    palette.financial.pending.DEFAULT,
  );
  root.style.setProperty(
    "--financial-pending-fg",
    palette.financial.pending.foreground,
  );
  root.style.setProperty(
    "--financial-pending-bg",
    palette.financial.pending.subtle,
  );
  root.style.setProperty(
    "--financial-pending-border",
    palette.financial.pending.border,
  );

  root.style.setProperty(
    "--financial-critical",
    palette.financial.critical.DEFAULT,
  );
  root.style.setProperty(
    "--financial-critical-fg",
    palette.financial.critical.foreground,
  );
  root.style.setProperty(
    "--financial-critical-bg",
    palette.financial.critical.subtle,
  );
  root.style.setProperty(
    "--financial-critical-border",
    palette.financial.critical.border,
  );

  root.style.setProperty("--financial-info", palette.financial.info.DEFAULT);
  root.style.setProperty(
    "--financial-info-fg",
    palette.financial.info.foreground,
  );
  root.style.setProperty("--financial-info-bg", palette.financial.info.subtle);
  root.style.setProperty(
    "--financial-info-border",
    palette.financial.info.border,
  );

  // 6. BASE SURFACES
  root.style.setProperty("--background", palette.base.background);
  root.style.setProperty("--foreground", palette.base.foreground);
  root.style.setProperty("--card", palette.base.card);
  root.style.setProperty("--card-foreground", palette.base.cardForeground);
  root.style.setProperty("--muted", palette.base.muted);
  root.style.setProperty("--muted-foreground", palette.base.mutedForeground);
  root.style.setProperty("--border", palette.base.border);

  try {
    localStorage.setItem(THEME_CONFIG.storageKey, themeId);
  } catch {
    // Ignore
  }
}

/**
 * Initializes the theme on application mount
 */
export function initTheme(): ThemePaletteId {
  const active = getActiveTheme();
  applyTheme(active);
  return active;
}

// Re-export tokens for direct access
export * from "./tokens";
