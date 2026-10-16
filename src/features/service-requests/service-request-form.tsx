import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../auth/use-auth";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";

export interface ServiceRequestItem {
  id: string;
  category: "LOAN" | "INSTALLMENT" | "FEE" | "GENERAL";
  summary: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  createdAt: string;
}

const CATEGORY_OPTIONS: {
  value: ServiceRequestItem["category"];
  label: string;
}[] = [
  { value: "GENERAL", label: "Consulta general institucional" },
  { value: "LOAN", label: "Préstamos y reprogramación" },
  { value: "INSTALLMENT", label: "Cuotas y fechas de pago" },
  { value: "FEE", label: "Revisión de comisiones o cargos" },
];

const INITIAL_REQUESTS: ServiceRequestItem[] = [
  {
    id: "SR-000001",
    category: "LOAN",
    summary: "Revisión de reprogramación de cuota de préstamo activo.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const requestSchema = z.object({
  category: z.enum(["LOAN", "INSTALLMENT", "FEE", "GENERAL"]),
  summary: z
    .string()
    .trim()
    .min(5, "El resumen debe tener al menos 5 caracteres.")
    .max(240, "El resumen no puede exceder 240 caracteres."),
});

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function ServiceRequestForm() {
  const { user } = useAuth();
  const customerId = user?.id || "CUST-0001";
  const storageKey = `aegisbank_requests_${customerId}`;

  const [requests, setRequests] = useState<ServiceRequestItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_REQUESTS;
  });

  const [submittedTicket, setSubmittedTicket] =
    useState<ServiceRequestItem | null>(null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(requests));
    } catch {
      // Ignore quota errors
    }
  }, [requests, storageKey]);

  const form = useForm({
    defaultValues: {
      category: "GENERAL" as ServiceRequestItem["category"],
      summary: "",
    },
    validators: {
      onChange: requestSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = requestSchema.parse(value);
      const nextNum = requests.length + 1;
      const nextId = `SR-${String(nextNum).padStart(6, "0")}`;

      const newRequest: ServiceRequestItem = {
        id: nextId,
        category: parsed.category,
        summary: parsed.summary,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };

      setRequests((prev) => [newRequest, ...prev]);
      setSubmittedTicket(newRequest);
      form.reset();
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Success Receipt Banner when a request is registered */}
      {submittedTicket ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm transition-all"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Solicitud {submittedTicket.id} registrada con éxito
                  </h2>
                  <Badge variant="success">Radicada</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  {submittedTicket.summary}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Gobernanza bancaria HITL:
                  </span>{" "}
                  Esta solicitud ha sido radicada formalmente bajo el protocolo
                  de supervisión humana. Puedes realizar seguimiento a su estado
                  en cualquier momento mediante el Asistente Aegis.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
              <Link
                to="/app/assistant"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[var(--primary-hover)] active:scale-95 motion-reduce:transform-none"
              >
                <span>Consultar en Asistente</span>
                <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Creation Form Column */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Nueva solicitud de servicio</CardTitle>
              <CardDescription>
                Registra una consulta formal, reclamo o trámite supervisado en
                AegisBank.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void form.handleSubmit();
                }}
                className="space-y-4"
              >
                {/* Category Selector */}
                <form.Field name="category">
                  {(field) => (
                    <div>
                      <label
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                        htmlFor={field.name}
                      >
                        Categoría de la solicitud
                      </label>
                      <select
                        id={field.name}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-2xs transition hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value as ServiceRequestItem["category"],
                          )
                        }
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form.Field>

                {/* Summary Textarea */}
                <form.Field name="summary">
                  {(field) => (
                    <div>
                      <label
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                        htmlFor={field.name}
                      >
                        Resumen detallado
                      </label>
                      <textarea
                        id={field.name}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Describe detalladamente el requerimiento, cuota, préstamo o consulta..."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-describedby={`${field.name}-error`}
                      />
                      {field.state.meta.errors.length > 0 ? (
                        <p
                          id={`${field.name}-error`}
                          className="mt-1.5 text-xs font-medium text-rose-600"
                          role="alert"
                        >
                          {field.state.meta.errors.join(" ")}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">
                          Mínimo 5 caracteres y máximo 240 caracteres.
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            aria-hidden="true"
                          />
                          <span>Guardando…</span>
                        </>
                      ) : (
                        "Registrar solicitud"
                      )}
                    </Button>
                  )}
                </form.Subscribe>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Supervisión bancaria obligatoria (HITL)
                  </div>
                  <p className="mt-1 leading-relaxed">
                    Toda solicitud de servicio o reclamo requiere trazabilidad
                    segura y supervisión humana explícita antes de efectuar
                    cambios en Core Banking.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Requests Feed Column */}
        <div className="lg:col-span-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
                  Tus solicitudes registradas
                </CardTitle>
                <Badge variant="outline" className="font-mono">
                  {requests.length} activa{requests.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <CardDescription>
                Historial de reclamos y consultas de tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No tienes solicitudes registradas.
                </div>
              ) : (
                requests.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {item.id}
                      </span>
                      <Badge
                        variant={
                          item.status === "OPEN"
                            ? "default"
                            : item.status === "IN_REVIEW"
                              ? "warning"
                              : "success"
                        }
                        className="text-[10px]"
                      >
                        {item.status === "OPEN"
                          ? "Abierta"
                          : item.status === "IN_REVIEW"
                            ? "En revisión"
                            : "Resuelta"}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-slate-800 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                        {CATEGORY_OPTIONS.find((c) => c.value === item.category)
                          ?.label || item.category}
                      </span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
