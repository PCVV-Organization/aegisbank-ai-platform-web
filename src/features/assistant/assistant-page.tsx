import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/use-auth";
import { type ChatMessage } from "./api/assistant-contracts";
import { decideAssistantApproval } from "./api/assistant-api";
import { useAssistantRun } from "./queries/use-assistant-run";
import { useConversationHistory } from "./queries/use-conversation-history";

const QUICK_SUGGESTIONS = [
  "¿Cuál es mi saldo disponible?",
  "¿Cuántos préstamos tengo activos?",
  "¿Cuándo es mi próxima fecha de pago?",
  "¿Tengo alguna cuota vencida?",
  "Quiero registrar un reclamo de servicio",
];

function formatTime(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatLatency(ms?: number): string {
  if (ms === undefined || ms === null) return "";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function sanitizeRestoredMessage(message: ChatMessage): ChatMessage {
  if (message.role !== "assistant") return message;
  const unsafe =
    /functools\s*\(|\[\s*\{\s*["']name["']|\{\s*["']name["']\s*:\s*["'](?:search_knowledge|get_my_loans|get_loan_details|get_next_installment|create_service_request)/i.test(
      message.content,
    );
  return unsafe
    ? {
        ...message,
        content:
          "No pude recuperar una respuesta segura para esta consulta. Vuelve a formularla para obtener información bancaria autorizada.",
      }
    : message;
}

export function AssistantPage() {
  const { user } = useAuth();
  const customerId = user?.id || "CUST-0001";
  const storageKey = `aegisbank_chat_history_${customerId}`;
  const sessionKey = `aegisbank_chat_session_${customerId}`;

  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) return saved;
      const initial = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(sessionKey, initial);
      return initial;
    } catch {
      return `sess_${Date.now()}_default`;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved
        ? (JSON.parse(saved) as ChatMessage[]).map(sanitizeRestoredMessage)
        : [];
    } catch {
      return [];
    }
  });

  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submissionInFlightRef = useRef<string | null>(null);
  const run = useAssistantRun();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApproval = async (approvalId: string, approved: boolean) => {
    setApprovingId(approvalId);
    try {
      const decision = await decideAssistantApproval(approvalId, approved);
      const serviceRequestId =
        decision.approval.execution_result?.service_request_id;
      setMessages((current) =>
        current.map((message) =>
          message.approvalRequests?.some(
            (request) => request.approval_id === approvalId,
          )
            ? {
                ...message,
                approvalRequests: message.approvalRequests.map((request) =>
                  request.approval_id === approvalId
                    ? { ...request, status: approved ? "EXECUTED" : "REJECTED" }
                    : request,
                ),
              }
            : message,
        ),
      );
      if (approved && decision.executed && serviceRequestId) {
        setMessages((current) =>
          current.map((message) =>
            message.approvalRequests?.some(
              (request) => request.approval_id === approvalId,
            )
              ? {
                  ...message,
                  content: `${message.content}\n\nSolicitud registrada correctamente. Número de reclamo: ${serviceRequestId}.`,
                }
              : message,
          ),
        );
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2000);
    } catch {
      // Fallback in environments without clipboard permissions
    }
  };

  // Keep sessionStorage in sync whenever messages change
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore quota errors in constrained environments
    }
  }, [messages, storageKey]);

  const { data: remoteTurns } = useConversationHistory(sessionId);

  // Rehydrate the active session from the customer-partitioned Cosmos history.
  // Browser storage is only a fast cache; the server remains authoritative.
  useEffect(() => {
    if (!remoteTurns || !remoteTurns.length) return;
    const restored = remoteTurns.map((turn) =>
      sanitizeRestoredMessage({
        id: turn.id,
        role: turn.role,
        content: turn.content,
        timestamp: turn.timestamp,
        ...(turn.metadata?.execution_mode
          ? { executionMode: turn.metadata.execution_mode }
          : {}),
        ...(typeof turn.metadata?.latency_ms === "number"
          ? { latencyMs: turn.metadata.latency_ms }
          : {}),
        ...(typeof turn.metadata?.tool_count === "number"
          ? { toolCount: turn.metadata.tool_count }
          : {}),
        ...(typeof turn.metadata?.rounds === "number"
          ? { rounds: turn.metadata.rounds }
          : {}),
      }),
    );
    setMessages((current) => {
      const byId = new Map(current.map((item) => [item.id, item]));
      for (const item of restored) byId.set(item.id, item);
      return [...byId.values()].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    });
  }, [remoteTurns]);

  // Keep sessionStorage in sync for sessionId
  useEffect(() => {
    try {
      sessionStorage.setItem(sessionKey, sessionId);
    } catch {
      // Ignore
    }
  }, [sessionId, sessionKey]);

  // Auto-scroll to the newest message or typing indicator
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, run.isPending]);

  const handleStartNewChat = () => {
    const nextSession = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(nextSession);
    setMessages([]);
    try {
      sessionStorage.removeItem(storageKey);
      sessionStorage.setItem(sessionKey, nextSession);
    } catch {
      // Ignore
    }
    inputRef.current?.focus();
  };

  const submitMessage = (textToSend: string) => {
    const cleanText = textToSend.trim();
    const submissionKey = `${sessionId}:${cleanText}`;
    // React batches state updates, so two rapid submit events can arrive
    // before TanStack Query exposes isPending. Keep an imperative guard for
    // the short interval in which the mutation is being scheduled.
    if (
      !cleanText ||
      run.isPending ||
      submissionInFlightRef.current === submissionKey
    )
      return;
    submissionInFlightRef.current = submissionKey;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: "user",
      content: cleanText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    run.mutate(
      { message: cleanText, sessionId },
      {
        onSuccess: (data) => {
          submissionInFlightRef.current = null;
          if (data.session_id && data.session_id !== sessionId) {
            setSessionId(data.session_id);
          }
          const assistantMsg: ChatMessage = {
            id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            role: "assistant",
            content: data.answer,
            timestamp: new Date().toISOString(),
            executionMode: data.execution_mode,
            latencyMs: data.latency_ms,
            toolCount: data.tool_count,
            rounds: data.rounds,
            approvalRequests: data.approval_requests,
            guidedRequest: data.guided_request,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        },
        onError: () => {
          submissionInFlightRef.current = null;
          const errorMsg: ChatMessage = {
            id: `err_${Date.now()}`,
            role: "assistant",
            content:
              "Lo sentimos, no pudimos conectar con el asistente bancario en este momento. Por favor verifica tu conexión y vuelve a intentar.",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        },
      },
    );
  };

  return (
    <section className="mx-auto flex h-[calc(100vh-6.5rem)] max-w-5xl flex-col">
      {/* Header with High-Trust Banking Branding & Session Controls */}
      <header className="mb-4 flex flex-shrink-0 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-sm">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Aegis assistant
              </h1>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                AI Banking
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Soporte bancario inteligente · Cliente:{" "}
              <span className="font-semibold text-slate-700">{customerId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Sesión segura
          </div>
          <button
            type="button"
            onClick={handleStartNewChat}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-100 hover:border-slate-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 motion-reduce:transform-none"
            title="Iniciar una nueva conversación limpia"
          >
            <svg
              className="h-3.5 w-3.5 text-slate-500 transition-transform duration-300 group-hover:rotate-180 motion-reduce:transform-none"
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
            Nueva conversación
          </button>
        </div>
      </header>

      {/* Main Conversational Timeline Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {/* Scrollable Message Transcript */}
        <div
          ref={transcriptRef}
          className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-busy={run.isPending}
        >
          {messages.length === 0 && !run.isPending ? (
            <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
                ¿En qué puedo orientarte hoy?
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-slate-500">
                Consulta tus saldos, el estado de tus préstamos o solicita
                información institucional en tiempo real.
              </p>

              {/* Empty state suggestions */}
              <div className="mt-6 flex w-full max-w-lg flex-col gap-2">
                <p className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Consultas sugeridas
                </p>
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitMessage(suggestion)}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left text-sm font-medium text-slate-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-900 hover:shadow-xs active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-600 motion-reduce:transform-none"
                  >
                    <span>{suggestion}</span>
                    <span
                      className="text-xs text-slate-400 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Render All Historical & Active Messages */}
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex w-full ${
                item.role === "user"
                  ? "justify-end animate-message-right"
                  : "justify-start animate-message-left"
              }`}
            >
              <div
                className={`flex max-w-[88%] gap-3 sm:max-w-[75%] ${
                  item.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                {item.role === "assistant" ? (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xs">
                    <span className="text-xs font-bold">AB</span>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-xs">
                    <span className="text-xs font-bold">Tú</span>
                  </div>
                )}

                {/* Message Body & Metadata */}
                <div className="flex flex-col">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      item.role === "user"
                        ? "rounded-tr-xs bg-[var(--primary)] text-white"
                        : "rounded-tl-xs border border-slate-200/90 bg-slate-50 text-slate-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {sanitizeRestoredMessage(item).content}
                    </p>

                    {item.approvalRequests
                      ?.filter((request) => request.status === "PENDING")
                      .map((request) => (
                        <div
                          key={request.approval_id}
                          className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"
                        >
                          <p className="font-semibold">Aprobación necesaria</p>
                          <p className="mt-1">
                            Se propone registrar esta solicitud en Core Banking.
                            No se ejecutará sin tu confirmación.
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={approvingId === request.approval_id}
                              onClick={() =>
                                void handleApproval(request.approval_id, true)
                              }
                              className="rounded-lg bg-emerald-700 px-3 py-1.5 font-semibold text-white disabled:opacity-50"
                            >
                              Aprobar y registrar
                            </button>
                            <button
                              type="button"
                              disabled={approvingId === request.approval_id}
                              onClick={() =>
                                void handleApproval(request.approval_id, false)
                              }
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}

                    {item.role === "assistant" &&
                    item.guidedRequest?.options?.length ? (
                      <div
                        className="mt-3 space-y-2 border-t border-slate-200/70 pt-3"
                        aria-label="Opciones para tu solicitud"
                      >
                        <p className="text-xs font-semibold text-slate-600">
                          Selecciona una opción
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.guidedRequest.options.map((option) => (
                            <button
                              key={
                                option.reason_code ??
                                option.category ??
                                option.label
                              }
                              type="button"
                              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-left text-xs font-semibold text-blue-900 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600"
                              title={option.description}
                              onClick={() => {
                                const selection = option.reason_code
                                  ? `Selecciono el motivo: ${option.label}. ${option.requires_description ? "Mi detalle es: " : ""}`
                                  : `Quiero registrar un reclamo de categoría ${option.category}.`;
                                inputRef.current?.focus();
                                setMessage(selection);
                              }}
                            >
                              <span className="block">{option.label}</span>
                              {option.description ? (
                                <span className="mt-0.5 block font-normal text-slate-600">
                                  {option.description}
                                </span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {item.role === "assistant" &&
                    (item.executionMode || item.latencyMs !== undefined) ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-2 text-xs">
                        {item.executionMode === "azure-foundry" ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse motion-reduce:animate-none"
                              aria-hidden="true"
                            />
                            Azure AI Foundry
                          </span>
                        ) : item.executionMode === "cloud-fallback" ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Fallback local
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            Consulta estructurada
                          </span>
                        )}

                        {item.latencyMs !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                            <span aria-hidden="true">⚡</span>
                            {formatLatency(item.latencyMs)}
                          </span>
                        ) : null}

                        {item.toolCount !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                            <span aria-hidden="true">🛠️</span>
                            {item.toolCount}{" "}
                            {item.toolCount === 1
                              ? "herramienta"
                              : "herramientas"}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2 px-1">
                    <span
                      className={`text-[11px] text-slate-500 ${
                        item.role === "user" ? "w-full text-right" : "text-left"
                      }`}
                    >
                      {formatTime(item.timestamp)}
                    </span>

                    {item.role === "assistant" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            item.id,
                            sanitizeRestoredMessage(item).content,
                          )
                        }
                        className="group inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-600 active:scale-95 motion-reduce:transform-none"
                        aria-label="Copiar respuesta al portapapeles"
                      >
                        {copiedId === item.id ? (
                          <>
                            <svg
                              className="h-3 w-3 text-emerald-600 transition-transform duration-200"
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
                            <span className="font-semibold text-emerald-700">
                              Copiado
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-3 w-3 text-slate-400 transition-colors group-hover:text-slate-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* In-Stream Typing Indicator (Never Blanks the Chat) */}
          {run.isPending ? (
            <div className="flex w-full justify-start animate-message-left">
              <div className="flex max-w-[85%] items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xs">
                  <span className="text-xs font-bold">AB</span>
                </div>
                <div className="flex flex-col">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-xs border border-slate-200/80 bg-slate-50 px-4 py-3 shadow-xs">
                    <div
                      className="flex items-center gap-1.5"
                      aria-hidden="true"
                    >
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      Consultando AegisBank…
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] text-slate-400">
                    Verificando información bancaria
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Suggestion Chips (Docked above input when chat is active) */}
        {messages.length > 0 && !run.isPending ? (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-xs">
            <span className="flex shrink-0 items-center font-medium text-slate-400">
              Sugerencias:
            </span>
            {QUICK_SUGGESTIONS.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submitMessage(suggestion)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 hover:shadow-xs active:scale-95 motion-reduce:transform-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        {/* Interactive Chat Form Input Bar */}
        <form
          className="border-t border-slate-200/80 bg-white p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage(message);
          }}
        >
          <div className="relative flex items-center">
            <label htmlFor="assistant-message" className="sr-only">
              Message
            </label>
            <input
              ref={inputRef}
              id="assistant-message"
              type="text"
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-4 pr-24 text-sm text-slate-900 shadow-inner transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask in English or Spanish (e.g. what is my balance?)"
              disabled={run.isPending}
            />
            <button
              type="submit"
              disabled={!message.trim() || run.isPending}
              aria-busy={run.isPending}
              className="group absolute right-1.5 flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[var(--primary-hover)] active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none"
              aria-label="Send"
            >
              {run.isPending ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  <span>Consultando…</span>
                </>
              ) : (
                <span>Send</span>
              )}
              {!run.isPending && (
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            AegisBank nunca te solicitará tu contraseña ni tu código de
            seguridad por este canal.
          </p>
        </form>
      </div>
    </section>
  );
}
