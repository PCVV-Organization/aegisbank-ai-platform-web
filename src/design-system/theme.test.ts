import { describe, it, expect, beforeEach } from "vitest";
import {
  BANK_PALETTES,
  THEME_CONFIG,
  applyTheme,
  getActiveTheme,
} from "./theme";

describe("Design System Theme & Palette Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defines complete functional roles for all predefined banking themes", () => {
    const requiredThemes = ["navy", "emerald", "sapphire", "slate"] as const;

    for (const themeId of requiredThemes) {
      const palette = BANK_PALETTES[themeId];
      expect(palette).toBeDefined();
      if (!palette) continue;

      // 1. Primary role
      expect(palette.primary.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.primary.hover).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.primary.active).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.primary.foreground).toBe("#ffffff");

      // 2. Secondary role
      expect(palette.secondary.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.secondary.foreground).toMatch(/^#[0-9a-fA-F]{6}$/);

      // 3. Accent & focus role
      expect(palette.accent.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.accent.ring).toMatch(/^#[0-9a-fA-F]{6}$/);

      // 4. Financial semantics (banking-ui-ux standards)
      expect(palette.financial.positive.DEFAULT).toBe("#059669");
      expect(palette.financial.pending.DEFAULT).toBe("#d97706");
      expect(palette.financial.critical.DEFAULT).toBe("#e11d48");
      expect(palette.financial.info.DEFAULT).toBe("#2563eb");
    }
  });

  it("applies theme variables atomically onto documentElement", () => {
    applyTheme("emerald");

    expect(document.documentElement.getAttribute("data-theme")).toBe("emerald");
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "#064e3b",
    );
    expect(
      document.documentElement.style.getPropertyValue("--financial-positive"),
    ).toBe("#059669");
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe(
      "#059669",
    );
  });

  it("reverts data-theme attribute on root for default corporate navy", () => {
    applyTheme("emerald");
    expect(document.documentElement.getAttribute("data-theme")).toBe("emerald");

    applyTheme("navy");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "#0f2747",
    );
  });

  it("falls back to defaultTheme when no preference is saved", () => {
    expect(getActiveTheme()).toBe(THEME_CONFIG.defaultTheme);
  });
});
