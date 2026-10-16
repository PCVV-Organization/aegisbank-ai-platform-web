import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useSessionTimeout } from "../../auth/use-session-timeout";

export function SessionTimeoutModal() {
  const {
    isWarningOpen,
    remainingSeconds,
    isExtending,
    extendSession,
    closeSession,
  } = useSessionTimeout();

  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  const progressPercent = Math.min(
    100,
    Math.max(0, (remainingSeconds / 60) * 100),
  );
  const isUrgent = remainingSeconds <= 15;

  return (
    <Dialog open={isWarningOpen}>
      <DialogContent
        className="sm:max-w-md border-amber-200/80 bg-white p-6 shadow-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center space-y-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-xs transition-colors ${
              isUrgent
                ? "bg-rose-100 text-rose-600 ring-4 ring-rose-50"
                : "bg-amber-100 text-amber-600 ring-4 ring-amber-50"
            }`}
          >
            <svg
              className="h-7 w-7 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div>
            <span
              className={`inline-block text-[11px] font-bold uppercase tracking-wider ${
                isUrgent ? "text-rose-700" : "text-amber-700"
              }`}
            >
              Aviso de Seguridad Bancaria
            </span>
            <DialogTitle className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              ¿Sigues ahí?
            </DialogTitle>
          </div>

          <DialogDescription className="text-sm text-slate-600 max-w-sm">
            Por tu seguridad financiera, tu sesión en AegisBank se cerrará
            automáticamente debido a inactividad en el último minuto.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-4">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-colors ${
              isUrgent
                ? "border-rose-200 bg-rose-50/60"
                : "border-amber-200/80 bg-amber-50/50"
            }`}
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isUrgent ? "text-rose-700" : "text-amber-800"
              }`}
            >
              Cierre automático en
            </span>
            <div
              className={`mt-1 text-4xl sm:text-5xl font-extrabold font-mono tabular-nums tracking-tight ${
                isUrgent ? "text-rose-600" : "text-amber-600"
              }`}
            >
              00:{formattedSeconds}
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  isUrgent
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-amber-500 to-amber-600"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 px-2 leading-relaxed">
            Si no confirmas tu actividad antes de que termine el tiempo,
            cerraremos tu sesión para proteger tus cuentas y datos personales.
          </p>
        </div>

        <DialogFooter className="mt-3 flex-col sm:flex-row gap-2.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            onClick={() => void closeSession()}
          >
            Cerrar sesión ahora
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs"
            disabled={isExtending}
            onClick={() => void extendSession()}
          >
            {isExtending ? "Verificando..." : "Seguir en la banca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
