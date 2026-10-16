/**
 * AegisBank Design System — Color Tokens & Palette Architecture
 *
 * Implements fintech visual trust standards per banking-ui-ux and WCAG 2.1 AA/AAA.
 *
 * Architecture:
 * Every theme decomposes into 6 explicit functional roles:
 * 1. Primary: Brand authority, highest-priority CTAs, identity banners.
 * 2. Secondary & Surface: Card panels, secondary CTAs, subtle structural depth.
 * 3. Accent & Interactive: Focus rings, active states, conversational cues, link highlights.
 * 4. Sidebar: Dedicated high-trust navigation dock.
 * 5. Financial Semantics: Positive (credits/approved), Pending (review/in-flight),
 *    Critical (debts/overdue/alerts), and Info (guidance/system).
 * 6. Base Canvas & Neutrals: Page background, card surface, typography.
 */

export interface ColorRoleShades {
  DEFAULT: string;
  hover: string;
  active: string;
  foreground: string;
  subtle?: string;
  border?: string;
}

export interface AccentRoleShades {
  DEFAULT: string;
  hover: string;
  foreground: string;
  ring: string;
  subtle: string;
}

export interface SidebarRoleShades {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  hover: string;
  active: string;
  activeBorder: string;
}

export interface SemanticStateShades {
  DEFAULT: string;
  foreground: string;
  subtle: string;
  border: string;
}

export interface FinancialSemanticRoles {
  positive: SemanticStateShades;
  pending: SemanticStateShades;
  critical: SemanticStateShades;
  info: SemanticStateShades;
}

export interface BaseNeutralRoles {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

export interface BankPaletteDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  /** Primary Role: Brand authority & dominant actions */
  primary: ColorRoleShades;
  /** Secondary Role: Hierarchy separation, subtle panels, secondary actions */
  secondary: ColorRoleShades;
  /** Accent & Interactive Role: Focus rings, active states, conversational cues */
  accent: AccentRoleShades;
  /** Sidebar Role: High-trust navigation dock */
  sidebar: SidebarRoleShades;
  /** Financial Semantics: Fixed fintech status colors */
  financial: FinancialSemanticRoles;
  /** Base Neutrals: Canvas, typography, borders */
  base: BaseNeutralRoles;
}

/**
 * Standard Financial Semantics shared across institutional banking.
 * High contrast (WCAG AAA compliant on white backgrounds).
 */
export const STANDARD_FINANCIAL_SEMANTICS: FinancialSemanticRoles = {
  positive: {
    DEFAULT: "#059669", // Emerald-600 (credits, approved, paid)
    foreground: "#065f46", // Emerald-800
    subtle: "#ecfdf5", // Emerald-50
    border: "#a7f3d0", // Emerald-200
  },
  pending: {
    DEFAULT: "#d97706", // Amber-600 (in-review, processing)
    foreground: "#92400e", // Amber-800
    subtle: "#fffbeb", // Amber-50
    border: "#fde68a", // Amber-200
  },
  critical: {
    DEFAULT: "#e11d48", // Rose-600 (overdue, debts, denied)
    foreground: "#9f1239", // Rose-800
    subtle: "#fff1f2", // Rose-50
    border: "#fecdd3", // Rose-200
  },
  info: {
    DEFAULT: "#2563eb", // Blue-600 (guidance, neutral info)
    foreground: "#1e40af", // Blue-800
    subtle: "#eff6ff", // Blue-50
    border: "#bfdbfe", // Blue-200
  },
};

/**
 * Base Neutral Canvas shared across all banking themes.
 */
export const STANDARD_BASE_NEUTRALS: BaseNeutralRoles = {
  background: "#f8fafc", // Slate-50 canvas
  foreground: "#0f172a", // Slate-900 high contrast typography
  card: "#ffffff", // Pure white card surfaces
  cardForeground: "#0f172a",
  muted: "#f1f5f9", // Slate-100 container backgrounds
  mutedForeground: "#64748b", // Slate-500 secondary typography
  border: "#e2e8f0", // Slate-200 divider lines
};

/**
 * Pre-configured Bank Theme Palettes.
 * To change or introduce a new palette, simply configure or add to this catalog.
 */
export const BANK_PALETTES: Record<string, BankPaletteDefinition> = {
  navy: {
    id: "navy",
    name: "Corporate Navy",
    code: "AEGIS-NAVY",
    description:
      "Paleta institucional clásica de AegisBank. Inspira solidez, seguridad y prestigio bancario.",
    primary: {
      DEFAULT: "#0f2747", // Institutional Deep Navy
      hover: "#173b6c", // Primary hover
      active: "#0a1b33", // Primary active/pressed
      foreground: "#ffffff", // Pure white on navy (contrast > 12:1)
      subtle: "#e8edf5", // Soft navy background tint
      border: "#173b6c",
    },
    secondary: {
      DEFAULT: "#f1f5f9", // Slate-100 secondary button/card
      hover: "#e2e8f0", // Slate-200 secondary hover
      active: "#cbd5e1", // Slate-300 secondary pressed
      foreground: "#0f172a", // Slate-900 typography
      border: "#cbd5e1", // Slate-300 secondary border
    },
    accent: {
      DEFAULT: "#2563eb", // Electric Blue accent
      hover: "#1d4ed8", // Deep blue hover
      foreground: "#ffffff",
      ring: "#2563eb", // Focus ring
      subtle: "#eff6ff", // Light blue badge fill
    },
    sidebar: {
      bg: "#0f2747",
      fg: "#f8fafc",
      muted: "#94a3b8",
      border: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.08)",
      active: "rgba(37, 99, 235, 0.25)",
      activeBorder: "#60a5fa",
    },
    financial: STANDARD_FINANCIAL_SEMANTICS,
    base: STANDARD_BASE_NEUTRALS,
  },

  emerald: {
    id: "emerald",
    name: "Private Emerald",
    code: "AEGIS-EMERALD",
    description:
      "Paleta de Banca Privada, Wealth Management y Finanzas Sostenibles ESG.",
    primary: {
      DEFAULT: "#064e3b", // Forest Emerald
      hover: "#047857", // Emerald-700
      active: "#022c22", // Emerald-950
      foreground: "#ffffff",
      subtle: "#ecfdf5",
      border: "#047857",
    },
    secondary: {
      DEFAULT: "#f0fdf4", // Emerald-50
      hover: "#dcfce7", // Emerald-100
      active: "#bbf7d0", // Emerald-200
      foreground: "#064e3b",
      border: "#86efac",
    },
    accent: {
      DEFAULT: "#059669", // Emerald-600
      hover: "#047857",
      foreground: "#ffffff",
      ring: "#10b981", // Emerald-500
      subtle: "#d1fae5",
    },
    sidebar: {
      bg: "#064e3b",
      fg: "#f8fafc",
      muted: "#a7f3d0",
      border: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.08)",
      active: "rgba(16, 185, 129, 0.25)",
      activeBorder: "#34d399",
    },
    financial: STANDARD_FINANCIAL_SEMANTICS,
    base: STANDARD_BASE_NEUTRALS,
  },

  sapphire: {
    id: "sapphire",
    name: "Fintech Sapphire",
    code: "AEGIS-SAPPHIRE",
    description:
      "Paleta digital contemporánea para banca minorista moderna y fintech ágil.",
    primary: {
      DEFAULT: "#1e3a8a", // Royal Blue
      hover: "#1d4ed8", // Blue-700
      active: "#172554", // Blue-950
      foreground: "#ffffff",
      subtle: "#eff6ff",
      border: "#1d4ed8",
    },
    secondary: {
      DEFAULT: "#f8fafc",
      hover: "#f1f5f9",
      active: "#e2e8f0",
      foreground: "#1e293b",
      border: "#cbd5e1",
    },
    accent: {
      DEFAULT: "#0284c7", // Sky-600
      hover: "#0369a1",
      foreground: "#ffffff",
      ring: "#38bdf8", // Sky-400
      subtle: "#e0f2fe",
    },
    sidebar: {
      bg: "#1e3a8a",
      fg: "#f8fafc",
      muted: "#93c5fd",
      border: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.08)",
      active: "rgba(59, 130, 246, 0.25)",
      activeBorder: "#93c5fd",
    },
    financial: STANDARD_FINANCIAL_SEMANTICS,
    base: STANDARD_BASE_NEUTRALS,
  },

  slate: {
    id: "slate",
    name: "Midnight Slate",
    code: "AEGIS-SLATE",
    description:
      "Paleta ejecutiva de alto contraste institucional para banca corporativa y tesorería.",
    primary: {
      DEFAULT: "#090d16", // Midnight Slate
      hover: "#1e293b", // Slate-800
      active: "#020617", // Slate-950
      foreground: "#ffffff",
      subtle: "#f1f5f9",
      border: "#1e293b",
    },
    secondary: {
      DEFAULT: "#f8fafc",
      hover: "#f1f5f9",
      active: "#e2e8f0",
      foreground: "#090d16",
      border: "#cbd5e1",
    },
    accent: {
      DEFAULT: "#0284c7", // Cyan-600
      hover: "#0369a1",
      foreground: "#ffffff",
      ring: "#38bdf8", // Cyan-400
      subtle: "#f0f9ff",
    },
    sidebar: {
      bg: "#090d16",
      fg: "#f8fafc",
      muted: "#94a3b8",
      border: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.08)",
      active: "rgba(148, 163, 184, 0.2)",
      activeBorder: "#38bdf8",
    },
    financial: STANDARD_FINANCIAL_SEMANTICS,
    base: STANDARD_BASE_NEUTRALS,
  },
};
