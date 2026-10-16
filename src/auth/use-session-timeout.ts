import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./use-auth";

const SESSION_STORAGE_EXPIRES_KEY = "aegisbank_session_expires_at";
const DEFAULT_SESSION_TIMEOUT_SECONDS =
  Number(import.meta.env.VITE_SESSION_TIMEOUT_SECONDS) || 900;
const WARNING_WINDOW_SECONDS = 60;
const ACTIVITY_DEBOUNCE_MS = 15_000;

export interface SessionTimeoutOptions {
  timeoutSeconds?: number;
  warningSeconds?: number;
}

export function useSessionTimeout(options?: SessionTimeoutOptions) {
  const { user, signOut, refreshSession } = useAuth();
  const navigate = useNavigate();

  const totalTimeoutSeconds =
    options?.timeoutSeconds ?? DEFAULT_SESSION_TIMEOUT_SECONDS;
  const warningWindowSeconds =
    options?.warningSeconds ?? WARNING_WINDOW_SECONDS;

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] =
    useState(warningWindowSeconds);
  const [isExtending, setIsExtending] = useState(false);

  const expiresAtRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());
  const isWarningOpenRef = useRef<boolean>(false);
  isWarningOpenRef.current = isWarningOpen;

  const resetExpirationTime = useCallback(
    (seconds: number = totalTimeoutSeconds) => {
      const newExpiresAt = Date.now() + seconds * 1000;
      expiresAtRef.current = newExpiresAt;
      try {
        sessionStorage.setItem(
          SESSION_STORAGE_EXPIRES_KEY,
          newExpiresAt.toString(),
        );
      } catch {
        // Ignore storage quota errors
      }
    },
    [totalTimeoutSeconds],
  );

  // Initialize or restore session expiration timestamp
  useEffect(() => {
    if (!user) {
      setIsWarningOpen(false);
      try {
        sessionStorage.removeItem(SESSION_STORAGE_EXPIRES_KEY);
      } catch {
        // Ignore
      }
      return;
    }

    const stored = (() => {
      try {
        return sessionStorage.getItem(SESSION_STORAGE_EXPIRES_KEY);
      } catch {
        return null;
      }
    })();

    const storedTimestamp = stored ? Number.parseInt(stored, 10) : 0;
    if (
      !options?.timeoutSeconds &&
      storedTimestamp &&
      storedTimestamp > Date.now()
    ) {
      expiresAtRef.current = storedTimestamp;
    } else {
      resetExpirationTime();
    }
  }, [user, options?.timeoutSeconds, resetExpirationTime]);

  // Handle immediate sign-out
  const closeSession = useCallback(async () => {
    setIsWarningOpen(false);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_EXPIRES_KEY);
    } catch {
      // Ignore
    }
    try {
      await signOut();
    } finally {
      navigate({ to: "/login" });
    }
  }, [signOut, navigate]);

  // Handle explicit session extension (user clicked "Continuar sesión")
  const extendSession = useCallback(async () => {
    if (isExtending) return;
    setIsExtending(true);
    try {
      if (refreshSession) {
        await refreshSession();
      }
      resetExpirationTime();
      setIsWarningOpen(false);
      setRemainingSeconds(warningWindowSeconds);
    } catch {
      // If refresh rejected (e.g. 401 on server), close session
      await closeSession();
    } finally {
      setIsExtending(false);
    }
  }, [
    isExtending,
    refreshSession,
    resetExpirationTime,
    warningWindowSeconds,
    closeSession,
  ]);

  // Track user activity when warning is NOT yet visible
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      // When the last-minute security warning is displayed, user MUST click
      // the explicit modal button to extend the session (banking security policy).
      if (isWarningOpenRef.current) return;

      const now = Date.now();
      if (now - lastActivityRef.current >= ACTIVITY_DEBOUNCE_MS) {
        lastActivityRef.current = now;
        resetExpirationTime();
      }
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, resetExpirationTime]);

  // Countdown timer and auto-logout evaluation
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeftSeconds = Math.max(
        0,
        Math.ceil((expiresAtRef.current - now) / 1000),
      );

      if (timeLeftSeconds <= 0) {
        // Time expired: auto-logout
        clearInterval(interval);
        void closeSession();
        return;
      }

      if (timeLeftSeconds <= warningWindowSeconds) {
        setIsWarningOpen(true);
        setRemainingSeconds(timeLeftSeconds);
      } else {
        if (isWarningOpenRef.current) {
          setIsWarningOpen(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, warningWindowSeconds, closeSession]);

  return {
    isWarningOpen,
    remainingSeconds,
    isExtending,
    extendSession,
    closeSession,
  };
}
