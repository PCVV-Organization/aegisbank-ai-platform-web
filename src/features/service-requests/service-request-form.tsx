import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { useServiceRequests } from "./queries/use-service-requests";
import type {
  ServiceRequestItem,
  ServiceRequestCategory,
} from "./api/service-request-contracts";

const CATEGORY_OPTIONS: {
  value: ServiceRequestCategory;
  label: string;
}[] = [
  { value: "GENERAL", label: "Consulta general institucional" },
  { value: "LOAN", label: "Préstamos y reprogramación" },
  { value: "INSTALLMENT", label: "Cuotas y fechas de pago" },
  { value: "FEE", label: "Revisión de comisiones o cargos" },
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
  const { requests, isLoading, isError: error } = useServiceRequests();

  const [submittedTicket, setSubmittedTicket] =
    useState<ServiceRequestItem | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      category: "GENERAL" as ServiceRequestCategory,
      summary: "",
    },
    validators: {
      onChange: requestSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmissionError(null);
      requestSchema.parse(value);
      setSubmissionError(
        "La solicitud requiere aprobación humana explícita antes de crear un registro en Core Banking.",
      );
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-emerald-950">
                    Solicitud radicada con éxito
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {submittedTicket.id}
                  </Badge>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Tu requerimiento ha sido registrado en el sistema bajo
                  supervisión bancaria auditada. Puedes consultar su estado en
                  cualquier momento con nuestro Asistente de IA.
                </p>
                <div className="pt-1 text-[11px] font-medium text-emerald-700">
                  Resumen: &ldquo;{submittedTicket.summary}&rdquo;
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100"
              >
                <Link
                  to="/app/assistant"
                  search={{
                    q: `¿Cuál es el estado de mi solicitud ${submittedTicket.id}?`,
                  }}
                >
                  Consultar con IA →
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                aria-label="Cerrar notificación"
                className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-200/50"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Form on Left, History on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Creation Form Column */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Nueva solicitud o reclamo
              </CardTitle>
              <CardDescription>
                Registra consultas operativas, reprogramaciones o revisiones de
                comisiones sobre tus productos sintéticos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionError ? (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
                >
                  {submissionError}
                </div>
              ) : null}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void form.handleSubmit();
                }}
                className="space-y-4"
              >
                {/* Category Selector */}
                <form.Field name="category">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor={field.name}
                        className="text-xs font-semibold text-slate-700"
                      >
                        Categoría de solicitud
                      </label>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value as ServiceRequestCategory,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition-colors focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {field.state.meta.errors ? (
                        <p className="text-xs text-rose-600">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                </form.Field>

                {/* Summary / Description Textarea */}
                <form.Field name="summary">
                  {(field) => (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={field.name}
                          className="text-xs font-semibold text-slate-700"
                        >
                          Descripción del caso
                        </label>
                        <span className="text-[11px] text-slate-600">
                          {field.state.value.length}/240
                        </span>
                      </div>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Ejemplo: Solicito reprogramación de cuota de crédito por cambio en fecha de pago laboral..."
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-600 transition-colors focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      />
                      {field.state.meta.errors ? (
                        <p className="text-xs text-rose-600">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                </form.Field>

                {/* Submit button & HITL notice */}
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
                          <span>Guardando en Core Banking…</span>
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
                  {isLoading
                    ? "..."
                    : `${requests.length} activa${requests.length === 1 ? "" : "s"}`}
                </Badge>
              </div>
              <CardDescription>
                Historial de reclamos y consultas de tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div
                  className="space-y-3"
                  role="status"
                  aria-label="Cargando solicitudes"
                >
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3.5 w-full" />
                      <div className="mt-1 flex items-center justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : requests.length === 0 ? (
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

              {error ? (
                <div className="pt-2 text-center text-xs text-amber-700">
                  Mostrando registros sincronizados en tu sesión local.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
