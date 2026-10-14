const SPANISH_MARKERS =
  /[¿¡]|\b(?:cu[aá]nt[oa]s?|saldo|pr[eé]stamos?|solicitudes?|tengo|mis|qu[eé]|c[oó]mo)\b/i;

export function buildSyntheticAnswer(rawQuery: string): string {
  const query = rawQuery.toLocaleLowerCase("es");
  const isSpanish = SPANISH_MARKERS.test(rawQuery);

  if (
    /\b(?:balance|available balance|saldo|dinero disponible|cu[aá]nto tengo)\b/i.test(
      query,
    )
  ) {
    return isSpanish
      ? "Tu saldo sintético disponible es de $12,480.00."
      : "Your available synthetic balance is $12,480.00.";
  }

  if (
    /\b(?:how many|number of|loans?|pr[eé]stamos?)\b/i.test(query) &&
    /\b(?:loan|loans|pr[eé]stamo|pr[eé]stamos|cu[aá]ntos?)\b/i.test(query)
  ) {
    return isSpanish
      ? "Tienes 2 préstamos sintéticos activos."
      : "You have 2 active synthetic loans.";
  }

  if (
    /\b(?:request|requests|service request|solicitud|solicitudes|requerimiento)\b/i.test(
      query,
    )
  ) {
    return isSpanish
      ? "Tienes 2 solicitudes de servicio sintéticas abiertas."
      : "You have 2 open synthetic service requests.";
  }

  return isSpanish
    ? `Puedo ayudarte con tu información bancaria sintética. Preguntaste: “${rawQuery}”`
    : `I can help with your synthetic banking information. You asked: “${rawQuery}”`;
}
