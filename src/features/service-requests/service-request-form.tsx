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

const categorySchema = z.enum(["LOAN", "INSTALLMENT", "FEE", "GENERAL"]);

const summarySchema = z
  .string()
  .trim()
  .min(5, "El resumen debe tener al menos 5 caracteres.")
  .max(240, "El resumen no puede exceder 240 caracteres.");

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if (
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
  }
  return String(error);
}

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
  const {
    requests,
    isLoading,
    isRefreshing,
    isError,
    error,
    refetch,
    createRequest,
    isCreating,
  } = useServiceRequests();

  const [submittedTicket, setSubmittedTicket] =
    useState<ServiceRequestItem | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      category: "GENERAL" as ServiceRequestCategory,
      summary: "",
    },
    onSubmit: async ({ value }) => {
      setSubmissionError(null);
      const catParsed = categorySchema.safeParse(value.category);
      if (!catParsed.success) {
        setSubmissionError(
          catParsed.error.issues[0]?.message || "Categoría no válida.",
        );
        return;
      }

      const sumParsed = summarySchema.safeParse(value.summary);
      if (!sumParsed.success) {
        setSubmissionError(
          sumParsed.error.issues[0]?.message ||
            "El resumen debe tener al menos 5 caracteres.",
        );
        return;
      }

      try {
        const newRecord = await createRequest({
          category: catParsed.data,
          summary: sumParsed.data,
        });
        setSubmittedTicket(newRecord);
        form.reset();
      } catch (err) {
        setSubmissionError(
          err instanceof Error
            ? err.message
            : "No se pudo registrar la solicitud en Core Banking. Intente nuevamente.",
        );
      }
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6 px-1 sm:space-y-8">
      {/* Success Receipt Banner when a request is registered */}
      {submittedTicket ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm transition-all sm:p-5"
        >
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3.5">
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
              <div className="min-w-0 space-y-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="min-w-0 text-sm font-semibold leading-5 text-emerald-950">
                    Solicitud radicada con éxito
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {submittedTicket.id}
                  </Badge>
                </div>
                <p className="text-xs leading-5 text-emerald-800">
                  Tu requerimiento ha sido registrado en el sistema bajo
                  supervisión bancaria auditada. Puedes consultar su estado en
                  cualquier momento con nuestro Asistente de IA.
                </p>
                <div className="break-words whitespace-pre-wrap pt-1 text-[11px] font-medium leading-5 text-emerald-700">
                  <span className="font-semibold">Resumen:</span>{" "}
                  <q>{submittedTicket.summary}</q>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
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
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-8">
        {/* Creation Form Column */}
        <div className="min-w-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Nueva solicitud de servicio
              </CardTitle>
              <CardDescription>
                Registra una consulta formal, reclamo o trámite supervisado en
                AegisBank.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              {submissionError ? (
                <div
                  role="alert"
                  className="mb-4 break-words rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800"
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
                className="min-w-0 space-y-5"
              >
                {/* Category Selector */}
                <form.Field
                  name="category"
                  validators={{
                    onChange: ({ value }) => {
                      const res = categorySchema.safeParse(value);
                      return res.success
                        ? undefined
                        : res.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor={field.name}
                        className="text-xs font-semibold text-slate-700"
                      >
                        Categoría de la solicitud
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
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-5 text-slate-900 shadow-xs transition-colors focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {field.state.meta.errors?.length ? (
                        <p className="text-xs text-rose-600" role="alert">
                          {field.state.meta.errors
                            .map(getErrorMessage)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                </form.Field>

                {/* Summary / Description Textarea */}
                <form.Field
                  name="summary"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return undefined; // Don't show error until user types or submits
                      }
                      const res = summarySchema.safeParse(value);
                      return res.success
                        ? undefined
                        : res.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => {
                    const hasError = Boolean(field.state.meta.errors?.length);
                    const errorMsg = field.state.meta.errors
                      ?.map(getErrorMessage)
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={field.name}
                            className="text-xs font-semibold text-slate-700"
                          >
                            Resumen detallado
                          </label>
                          <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
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
                          aria-invalid={hasError}
                          aria-describedby={
                            hasError ? `${field.name}-error` : undefined
                          }
                          placeholder="Describe detalladamente el requerimiento, cuota, préstamo o consulta..."
                          className="min-h-32 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 shadow-xs placeholder:text-slate-600 transition-colors focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                        />
                        {hasError && errorMsg ? (
                          <p
                            id={`${field.name}-error`}
                            className="text-xs text-rose-600"
                            role="alert"
                          >
                            {errorMsg}
                          </p>
                        ) : null}
                      </div>
                    );
                  }}
                </form.Field>

                {/* Submit button & HITL notice */}
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || isCreating}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting || isCreating ? (
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

                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  <div className="flex items-start gap-1.5 font-semibold text-slate-800">
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
        <div className="min-w-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <CardTitle className="min-w-0 text-base leading-6 sm:text-lg">
                  Tus solicitudes registradas
                </CardTitle>
                <Badge variant="outline" className="shrink-0 font-mono">
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
              {isRefreshing && requests.length > 0 ? (
                <div
                  className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 animate-pulse"
                  aria-live="polite"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Sincronizando con Core Banking en tiempo real…</span>
                </div>
              ) : null}
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
              ) : isError ? (
                <div
                  role="alert"
                  className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-center text-xs text-rose-800"
                >
                  <p className="font-semibold">
                    No se pudo cargar el historial desde Core Banking.
                  </p>
                  <p className="text-[11px] text-rose-600 leading-relaxed">
                    {error instanceof Error
                      ? error.message
                      : "Verifica la conexión con el servicio bancario o reintenta."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    className="border-rose-300 bg-white text-rose-800 hover:bg-rose-100"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No tienes solicitudes registradas en Core Banking.
                </div>
              ) : (
                requests.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-2xs"
                  >
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 break-all font-mono text-xs font-bold text-slate-900">
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
                        className="shrink-0 text-[10px]"
                      >
                        {item.status === "OPEN"
                          ? "Abierta"
                          : item.status === "IN_REVIEW"
                            ? "En revisión"
                            : "Resuelta"}
                      </Badge>
                    </div>
                    <p className="break-words whitespace-pre-wrap text-xs font-medium leading-5 text-slate-800">
                      {item.summary}
                    </p>
                    <div className="mt-1 flex min-w-0 flex-wrap items-start gap-2 text-[11px] leading-4 text-slate-500">
                      <span className="max-w-full break-words rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                        {CATEGORY_OPTIONS.find((c) => c.value === item.category)
                          ?.label || item.category}
                      </span>
                      <time
                        className="break-words pt-0.5"
                        dateTime={item.createdAt}
                      >
                        {formatDate(item.createdAt)}
                      </time>
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
