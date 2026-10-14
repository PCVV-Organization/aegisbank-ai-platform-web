import { describe, expect, it } from "vitest";
import { buildSyntheticAnswer } from "./synthetic-assistant";

describe("buildSyntheticAnswer", () => {
  it("answers Spanish loan-count questions with the synthetic count", () => {
    expect(buildSyntheticAnswer("cuantos prestamos tengo")).toBe(
      "Tienes 2 préstamos sintéticos activos.",
    );
  });

  it("answers English loan-count questions without changing language", () => {
    expect(buildSyntheticAnswer("How many loans do I have?")).toBe(
      "You have 2 active synthetic loans.",
    );
  });

  it("answers Spanish balance questions in Spanish", () => {
    expect(buildSyntheticAnswer("cuál es mi saldo")).toBe(
      "Tu saldo sintético disponible es de $12,480.00.",
    );
  });

  it("answers Spanish service-request questions in Spanish", () => {
    expect(buildSyntheticAnswer("cuantas solicitudes tengo")).toBe(
      "Tienes 2 solicitudes de servicio sintéticas abiertas.",
    );
  });
});
