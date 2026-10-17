import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
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
  ServiceRequestStatus,
  ServiceRequestReasonCode,
} from "./api/service-request-contracts";

const REASON_OPTIONS: Record<ServiceRequestCategory, { code: ServiceRequestReasonCode; label: string; description: string }[]> = {
  LOAN: [
    { code: "LOAN_RESTRUCTURING", label: "Reprogramación del préstamo", description: "Revisión o reprogramación de cuotas." },
    { code: "LOAN_BALANCE_DISPUTE", label: "Saldo o detalle del préstamo", description: "Diferencia en saldo o detalle." },
    { code: "LOAN_INTEREST_RATE", label: "Tasa de interés del préstamo", description: "Consultar o reclamar la tasa aplicada." },
    { code: "LOAN_PAYMENT_DIFFICULTY", label: "Dificultad para pagar", description: "Orientación por dificultad temporal de pago." },
  ],
  INSTALLMENT: [
    { code: "INSTALLMENT_DATE", label: "Fecha de vencimiento", description: "Consulta o reclamo sobre la fecha." },
    { code: "INSTALLMENT_DUPLICATE_CHARGE", label: "Cobro duplicado de cuota", description: "Reportar un cobro repetido." },
    { code: "INSTALLMENT_AMOUNT_DISPUTE", label: "Importe de cuota incorrecto", description: "El importe no coincide." },
    { code: "INSTALLMENT_PAYMENT_NOT_REFLECTED", label: "Pago no reflejado", description: "El pago aún no aparece aplicado." },
    { code: "INSTALLMENT_OVERDUE_DISPUTE", label: "Mora o vencimiento incorrecto", description: "La cuota fue marcada como vencida incorrectamente." },
  ],
  FEE: [
    { code: "FEE_UNRECOGNIZED", label: "Comisión o cargo no reconocido", description: "No reconoces el cargo." },
    { code: "FEE_DUPLICATE_CHARGE", label: "Comisión o cargo duplicado", description: "Reportar un cargo repetido." },
    { code: "FEE_AMOUNT_DISPUTE", label: "Importe de comisión incorrecto", description: "El importe de la comisión no coincide." },
    { code: "FEE_REFUND_REQUEST", label: "Solicitud de devolución", description: "Solicitar revisión para posible devolución." },
  ],
  GENERAL: [
    { code: "GENERAL_FRAUD", label: "Fraude o estafa", description: "Reportar actividad fraudulenta." },
    { code: "GENERAL_ACCOUNT_ACCESS", label: "Acceso o seguridad de cuenta", description: "Reportar un problema de acceso o seguridad." },
    { code: "GENERAL_DATA_UPDATE", label: "Actualización de datos", description: "Orientación para actualizar datos." },
    { code: "GENERAL_STATUS", label: "Estado de una solicitud", description: "Consultar un reclamo o solicitud existente." },
    { code: "GENERAL_OTHER", label: "Otro motivo", description: "Describe el motivo." },
  ],
};

const CATEGORY_OPTIONS: {
  value: ServiceRequestCategory;
  label: string;
  shortLabel: string;
  badgeClass: string;
}[] = [
  {
    value: "GENERAL",
    label: "Consulta general institucional",
    shortLabel: "Consulta general",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100",
  },
  {
    value: "LOAN",
    label: "Préstamos y reprogramación",
    shortLabel: "Préstamos",
    badgeClass:
      "bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100",
  },
  {
    value: "INSTALLMENT",
    label: "Cuotas y fechas de pago",
    shortLabel: "Cuotas / Pagos",
    badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200/80 hover:bg-cyan-100",
  },
  {
    value: "FEE",
    label: "Revisión de comisiones o cargos",
    shortLabel: "Comisiones y cargos",
    badgeClass:
      "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100",
  },
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
    const formatted = date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    // Replace all regular spaces with non-breaking spaces (\u00A0) so
    // elements like "p. m." and time digits NEVER split across multiple lines.
    return formatted.replace(/\s+/g, "\u00A0");
  } catch {
    return isoString;
  }
}

function getStatusBadge(status: ServiceRequestStatus) {
  switch (status) {
    case "OPEN":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Abierta
        </span>
      );
    case "IN_REVIEW":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          En revisión
        </span>
      );
    case "RESOLVED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Resuelta
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
          {status}
        </span>
      );
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
      reasonCode: "GENERAL_OTHER" as ServiceRequestReasonCode,
      reasonLabel: "Otro motivo",
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
          reasonCode: value.reasonCode,
          reasonLabel:
            REASON_OPTIONS[catParsed.data].find((item) => item.code === value.reasonCode)?.label ?? "Otro motivo",
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
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6 sm:space-y-8">
      {/* Success Receipt Banner when a request is registered */}
      {submittedTicket ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/80 p-5 shadow-sm transition-all sm:p-6"
        >
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30">
                <svg
                  className="h-6 w-6"
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
              <div className="min-w-0 space-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                  <h3 className="text-sm font-bold tracking-tight text-emerald-950 sm:text-base">
                    Solicitud radicada con éxito en Core Banking
                  </h3>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-white/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-md shadow-2xs">
                    {submittedTicket.id}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800 sm:text-sm">
                  Tu requerimiento ha sido registrado en el sistema bajo
                  supervisión bancaria inmutable. Puedes consultar su estado y
                  resolución en cualquier momento con nuestro Asistente de IA.
                </p>
                <div className="rounded-xl border border-emerald-200/80 bg-white/70 p-3 text-xs leading-relaxed text-emerald-900 shadow-2xs">
                  <span className="font-bold text-emerald-950">
                    Resumen registrado:
                  </span>{" "}
                  <q className="italic text-emerald-800">
                    {submittedTicket.summary}
                  </q>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-emerald-400 bg-white text-emerald-950 hover:bg-emerald-100 shadow-xs font-semibold"
              >
                <Link
                  to="/app/assistant"
                  search={{
                    q: `¿Cuál es el estado de mi solicitud ${submittedTicket.id}?`,
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <svg
                    className="h-4 w-4 text-emerald-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    />
                  </svg>
                  <span>Consultar con IA →</span>
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                aria-label="Cerrar notificación"
                className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-200/60 transition-colors"
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
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] lg:gap-8">
        {/* Creation Form Column */}
        <div className="min-w-0">
          <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200/60 shadow-2xs">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                    Nueva solicitud de servicio
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Registra una consulta formal, reclamo o trámite supervisado
                    en AegisBank.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="min-w-0 pt-5">
              {submissionError ? (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-2xs"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-rose-600 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="leading-relaxed font-medium">
                    {submissionError}
                  </span>
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
                        className="text-xs font-bold text-slate-800"
                      >
                        Categoría de la gestión
                      </label>
                      <div className="relative">
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            (() => {
                              const category = e.target.value as ServiceRequestCategory;
                              field.handleChange(category);
                              const options = REASON_OPTIONS[category];
                              if (options?.[0]) {
                                form.setFieldValue("reasonCode", options[0].code);
                              }
                            })()
                          }
                          className="min-h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 pr-10 py-2.5 text-sm font-medium leading-5 text-slate-900 shadow-xs transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                        >
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {field.state.meta.errors?.length ? (
                        <p
                          className="text-xs font-medium text-rose-600"
                          role="alert"
                        >
                          {field.state.meta.errors
                            .map(getErrorMessage)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                </form.Field>

                <form.Field name="reasonCode">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label htmlFor={field.name} className="text-xs font-bold text-slate-800">
                        Motivo de la solicitud
                      </label>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onChange={(event) => field.handleChange(event.target.value as ServiceRequestReasonCode)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      >
                        {REASON_OPTIONS[form.getFieldValue("category")].map((option) => (
                          <option key={option.code} value={option.code}>{option.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500">
                        {REASON_OPTIONS[form.getFieldValue("category")].find((option) => option.code === field.state.value)?.description}
                      </p>
                    </div>
                  )}
                </form.Field>

                {/* Summary / Description Textarea */}
                <form.Field
                  name="summary"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return undefined;
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
                            className="text-xs font-bold text-slate-800"
                          >
                            Resumen detallado del requerimiento
                          </label>
                          <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">
                            {field.state.value.length} / 240 caracteres
                          </span>
                        </div>
                        <textarea
                          id={field.name}
                          name={field.name}
                          rows={4}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={hasError}
                          aria-describedby={
                            hasError ? `${field.name}-error` : undefined
                          }
                          placeholder="Describe detalladamente el requerimiento, cuota, préstamo o consulta formal..."
                          className="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white p-3.5 text-sm leading-relaxed text-slate-900 shadow-xs placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                        />
                        {hasError && errorMsg ? (
                          <p
                            id={`${field.name}-error`}
                            className="text-xs font-medium text-rose-600"
                            role="alert"
                          >
                            {errorMsg}
                          </p>
                        ) : null}
                      </div>
                    );
                  }}
                </form.Field>

                {/* Submit button */}
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || isCreating}
                      className="min-h-11 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs hover:shadow transition-all inline-flex items-center justify-center gap-2 px-6 rounded-xl"
                    >
                      {isSubmitting || isCreating ? (
                        <>
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            aria-hidden="true"
                          />
                          <span>Guardando en Core Banking…</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4 text-slate-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                            />
                          </svg>
                          <span>Radicar solicitud</span>
                        </>
                      )}
                    </Button>
                  )}
                </form.Subscribe>

                {/* High-Trust HITL Compliance Badge */}
                <div className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 text-xs leading-relaxed text-slate-700 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <span>
                      Protocolo de Supervisión Bancaria Obligatoria (HITL)
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">
                    De acuerdo con el marco de seguridad financiera, toda
                    solicitud de servicio o reclamo se radica de forma inmutable
                    y requiere supervisión humana explícita antes de efectuar
                    cambios de balance en Core Banking.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Requests Feed Column */}
        <div className="min-w-0">
          <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-slate-900 sm:text-lg">
                    Tus solicitudes registradas
                  </CardTitle>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isLoading
                      ? "..."
                      : `${requests.length} activa${requests.length === 1 ? "" : "s"}`}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void refetch()}
                  disabled={isLoading || isRefreshing}
                  className="h-8 gap-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  title="Actualizar solicitudes desde Core Banking"
                >
                  <svg
                    className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Actualizar</span>
                </Button>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Historial de reclamos, reprogramaciones y gestiones bancarias.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
              {/* Subtle synchronization banner during background refetch */}
              {isRefreshing && requests.length > 0 ? (
                <div
                  className="flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/80 px-3.5 py-2 text-xs font-medium text-blue-800 shadow-2xs"
                  aria-live="polite"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Sincronizando con Core Banking en tiempo real…</span>
                </div>
              ) : null}

              {isLoading ? (
                <div
                  className="space-y-3"
                  role="status"
                  aria-label="Cargando solicitudes bancarias"
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <div className="mt-1 flex items-center justify-between">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3.5 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div
                  role="alert"
                  className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-5 text-center text-xs text-rose-800 shadow-2xs"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-rose-950">
                      No se pudo cargar el historial desde Core Banking
                    </p>
                    <p className="mt-1 text-rose-700 leading-relaxed">
                      {error instanceof Error
                        ? error.message
                        : "Verifica la conexión con el servicio bancario o reintenta."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    className="border-rose-300 bg-white text-rose-900 hover:bg-rose-100 font-semibold shadow-xs"
                  >
                    Reintentar conexión
                  </Button>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    No tienes solicitudes registradas en Core Banking
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Cuando registres una gestión formal, podrás realizar
                    seguimiento en tiempo real en este panel.
                  </p>
                </div>
              ) : (
                requests.map((item) => {
                  const catConfig = CATEGORY_OPTIONS.find(
                    (c) => c.value === item.category,
                  );

                  return (
                    <article
                      key={item.id}
                      className="group flex min-w-0 flex-col gap-2.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-blue-300 hover:shadow-xs"
                    >
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 tracking-wider">
                          {item.id}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      <p className="break-words whitespace-pre-wrap text-xs font-semibold leading-relaxed text-slate-900">
                        {item.summary}
                      </p>

                      <div className="mt-1 flex min-w-0 flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                            catConfig?.badgeClass ??
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {catConfig?.shortLabel || item.category}
                        </span>

                        <div className="flex items-center gap-3">
                          <time
                            className="whitespace-nowrap tabular-nums font-mono text-[11px] font-medium text-slate-500"
                            dateTime={item.createdAt}
                          >
                            {formatDate(item.createdAt)}
                          </time>

                          <Link
                            to="/app/assistant"
                            search={{
                              q: `¿Cuál es el estado de mi solicitud ${item.id}?`,
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                            title={`Consultar con el asistente sobre ${item.id}`}
                          >
                            <span>Consultar IA</span>
                            <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
