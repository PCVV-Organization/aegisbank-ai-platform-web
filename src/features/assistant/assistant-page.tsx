import { useEffect, useRef, useState } from "react";
import {
  loadAssistantMessages,
  type AssistantMessage,
  useAssistantRun,
} from "./use-assistant-run";

export function AssistantPage() {
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const run = useAssistantRun();
  useEffect(() => {
    if (run.data?.session_id && run.data.session_id !== sessionId) {
      setSessionId(run.data.session_id);
    }
  }, [run.data?.session_id, sessionId]);
  useEffect(() => {
    if (!sessionId) return;
    loadAssistantMessages(sessionId)
      .then(setMessages)
      .catch(() => undefined);
  }, [sessionId]);
  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
    });
  }, [messages, run.isPending]);
  const submitMessage = (value: string) => {
    const content = value.trim();
    if (!content || run.isPending) return;
    setMessages((current) => [...current, { role: "user", content }]);
    run.mutate(
      sessionId ? { message: content, sessionId } : { message: content },
      {
        onSuccess: (response) => {
          if (response.session_id) setSessionId(response.session_id);
          setMessages((current) => [
            ...current,
            { role: "assistant", content: response.answer },
          ]);
        },
      },
    );
  };
  const suggestedPrompts = [
    "¿Cuántos préstamos tengo?",
    "¿Cuándo me toca pagar?",
    "¿Cuál es mi saldo disponible?",
  ];
  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Digital banking · secure support
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Aegis assistant
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Your private banking companion for balances, loans and service
            requests. Ask in English or Spanish.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:self-auto">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Protected session
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(15,39,71,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">
          <div>
            <p className="font-semibold text-slate-950">AegisBank support</p>
            <p className="mt-1 text-xs text-slate-500">
              Answers grounded in your synthetic account
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            AI assisted
          </span>
        </div>
        <div
          ref={transcriptRef}
          className="flex min-h-[22rem] max-h-[32rem] flex-col gap-4 overflow-y-auto p-5 sm:p-7"
          aria-live="polite"
          aria-busy={run.isPending}
        >
          {messages.length === 0 && !run.isPending ? (
            <div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">How can I help?</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose a suggestion or write your question below. Your
                  conversation stays linked to this protected session.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600"
                      onClick={() => submitMessage(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {messages.map((item, index) => (
            <div
              className={
                item.role === "user" ? "flex justify-end" : "flex justify-start"
              }
              key={`${item.role}-${item.created_at ?? index}-${index}`}
            >
              <p
                className={
                  item.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#0f2747] px-4 py-3 text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-slate-900"
                }
              >
                {item.content}
              </p>
            </div>
          ))}
          {run.isPending ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              <span
                className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 motion-reduce:animate-none"
                aria-hidden="true"
              />
              <p className="font-medium text-slate-900" role="status">
                Consultando AegisBank…
              </p>
              <p className="text-sm text-slate-500">
                Estamos verificando tu información bancaria.
              </p>
            </div>
          ) : null}
        </div>
        <form
          className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (message.trim()) {
              submitMessage(message);
              setMessage("");
            }
          }}
        >
          <label className="sr-only" htmlFor="assistant-message">
            Message
          </label>
          <div className="flex gap-2">
            <input
              id="assistant-message"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask in English or Spanish"
              disabled={run.isPending}
            />
            <button
              className="min-h-12 rounded-xl bg-[#0f2747] px-5 py-3 font-semibold text-white transition hover:bg-[#173b6c] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={run.isPending}
            >
              <span className="inline-flex items-center gap-2">
                Send <span aria-hidden="true">↑</span>
              </span>
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Never share your password or full card number in chat.
          </p>
        </form>
      </div>
      {run.error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          We could not reach the assistant. Please try again.
        </p>
      ) : null}
    </section>
  );
}
