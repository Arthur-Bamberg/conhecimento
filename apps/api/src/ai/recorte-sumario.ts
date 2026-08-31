const MAX_SUMARIO = 160;
export const MAX_COLECAO = 280;

export function cortarSumario(texto: string, max = MAX_SUMARIO): string {
  const limpo = texto.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
  if (!limpo) {
    return "";
  }
  return limpo.length > max ? `${limpo.slice(0, max - 1)}…` : limpo;
}

export function recorteSumario(
  titulo: string,
  corpo: string,
  max = MAX_SUMARIO,
): string {
  const first = (corpo.split(/\n\s*\n/)[0] ?? "").replace(/\s+/g, " ").trim();
  return cortarSumario(first || titulo, max);
}

export function recorteColecao(
  textos: { titulo: string }[],
  max = MAX_COLECAO,
): string {
  if (textos.length === 0) {
    return "";
  }
  return cortarSumario(
    textos.map((texto) => texto.titulo.trim()).filter(Boolean).join("; "),
    max,
  );
}
