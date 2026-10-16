import { useState } from "react";
import { useAssistantRun } from "./use-assistant-run";

export function AssistantPage() {
  const [message, setMessage] = useState("");
  const run = useAssistantRun();
  return (
    <section className="mx-auto max-w-3xl">
      <p className="mb-2 text-sm font-medium text-blue-700">
        Guided banking support
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        Aegis assistant
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Ask about your synthetic banking information in English or Spanish.
        State-changing actions always require approval.
      </p>
      <div
        className="mt-8 min-h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        aria-live="polite"
        aria-busy={run.isPending}
      >
        {run.isPending ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
            <span
              className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
              aria-hidden="true"
            />
            <p className="font-medium text-slate-900">Consultando AegisBank…</p>
            <p className="text-sm text-slate-500">
              Estamos verificando tu información bancaria.
            </p>
          </div>
        ) : run.data ? (
          <p>{run.data.answer}</p>
        ) : (
          <div>
            <p className="font-medium text-slate-900">How can I help?</p>
            <p className="mt-2 text-slate-500">
              Try asking about your balance, loans, or open service requests.
            </p>
          </div>
        )}
      </div>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (message.trim()) {
            run.mutate(message.trim());
            setMessage("");
          }
        }}
      >
        <label className="sr-only" htmlFor="assistant-message">
          Message
        </label>
        <input
          id="assistant-message"
          className="min-h-12 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask in English or Spanish"
          disabled={run.isPending}
        />
        <button
          className="min-h-12 rounded-lg bg-[#0f2747] px-5 py-3 font-medium text-white transition hover:bg-[#173b6c] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={run.isPending}
        >
          Send
        </button>
      </form>
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
