import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./use-auth";
import { useSessionTimeout } from "./use-session-timeout";

// Mock router navigation
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("useSessionTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    mockNavigate.mockClear();
    // Ensure user is signed in
    useAuth.getState().signIn();
  });

  afterEach(() => {
    vi.useRealTimers();
    useAuth.getState().signOut();
  });

  it("does not open warning modal during normal active usage", () => {
    const { result } = renderHook(() =>
      useSessionTimeout({ timeoutSeconds: 300, warningSeconds: 60 }),
    );

    expect(result.current.isWarningOpen).toBe(false);
  });

  it("triggers warning modal in the last minute (when remaining time <= 60s)", () => {
    const { result } = renderHook(() =>
      useSessionTimeout({ timeoutSeconds: 70, warningSeconds: 60 }),
    );

    expect(result.current.isWarningOpen).toBe(false);

    // Advance 11 seconds: now 59 seconds left (inside the 60s warning window)
    act(() => {
      vi.advanceTimersByTime(11_000);
    });

    expect(result.current.isWarningOpen).toBe(true);
    expect(result.current.remainingSeconds).toBeLessThanOrEqual(60);
  });

  it("allows user to extend session, closing the warning and resetting the timer", async () => {
    const { result } = renderHook(() =>
      useSessionTimeout({ timeoutSeconds: 70, warningSeconds: 60 }),
    );

    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(result.current.isWarningOpen).toBe(true);

    // User confirms they are still on the page
    await act(async () => {
      await result.current.extendSession();
    });

    expect(result.current.isWarningOpen).toBe(false);
  });

  it("allows user to close session immediately from the modal", async () => {
    const { result } = renderHook(() =>
      useSessionTimeout({ timeoutSeconds: 70, warningSeconds: 60 }),
    );

    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(result.current.isWarningOpen).toBe(true);

    // User clicks "Cerrar sesión"
    await act(async () => {
      await result.current.closeSession();
    });

    expect(useAuth.getState().user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
  });

  it("automatically signs out when the final minute expires without user confirmation", async () => {
    renderHook(() =>
      useSessionTimeout({ timeoutSeconds: 10, warningSeconds: 5 }),
    );

    // Advance timer past expiration
    await act(async () => {
      await vi.advanceTimersByTimeAsync(11_000);
    });

    expect(useAuth.getState().user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
  });
});
