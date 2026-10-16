import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";

const requestSchema = z.object({
  summary: z.string().trim().min(5, "Use at least five characters").max(240),
});

export function ServiceRequestForm() {
  const form = useForm({
    defaultValues: { summary: "" },
    validators: { onChange: requestSchema },
    onSubmit: async ({ value }) => {
      requestSchema.parse(value);
    },
  });

  return (
    <Card className="mt-8 max-w-xl">
      <CardHeader>
        <CardTitle>Nueva solicitud de servicio</CardTitle>
        <CardDescription>
          Registra una consulta o reclamo formal en el sistema bancario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="summary">
            {(field) => (
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor={field.name}
                >
                  Resumen de la solicitud
                </label>
                <textarea
                  id={field.name}
                  className="min-h-32 w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Describe detalladamente el requerimiento o consulta..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-describedby={`${field.name}-error`}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p
                    id={`${field.name}-error`}
                    className="mt-2 text-sm text-rose-600"
                    role="alert"
                  >
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                className="mt-5 w-full sm:w-auto"
                type="submit"
                disabled={!canSubmit}
              >
                {isSubmitting ? "Guardando…" : "Registrar solicitud"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
