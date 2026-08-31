import type { TextoContexto } from "./context-builder";

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/u)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((t) => t.length >= 3);
}

function overlap(pedido: string, texto: TextoContexto): number {
  const hay = `${texto.titulo} ${texto.corpo}`.toLowerCase();
  return tokens(pedido).filter((t) => hay.includes(t)).length;
}

export function escolherTextoPorOverlap(
  pedido: string,
  textos: TextoContexto[],
): TextoContexto | undefined {
  if (textos.length === 0) {
    return undefined;
  }
  return [...textos].sort((a, b) => overlap(pedido, b) - overlap(pedido, a))[0];
}

export function resolverFontes(input: {
  resposta: string;
  pedido: string;
  textos: TextoContexto[];
}): { textoId: string; titulo: string }[] {
  const hay = input.resposta.toLowerCase();
  const citados = [...input.textos]
    .filter((t) => t.titulo.trim().length > 0)
    .sort((a, b) => b.titulo.length - a.titulo.length)
    .filter((t) => hay.includes(t.titulo.toLowerCase()));

  const semSubtitulo = citados.filter(
    (t, i) =>
      !citados.some(
        (outro, j) =>
          j < i &&
          outro.titulo.toLowerCase().includes(t.titulo.toLowerCase()),
      ),
  );

  if (semSubtitulo.length > 0) {
    return semSubtitulo.map((t) => ({ textoId: t.id, titulo: t.titulo }));
  }

  const porOverlap = escolherTextoPorOverlap(input.pedido, input.textos);
  return porOverlap
    ? [{ textoId: porOverlap.id, titulo: porOverlap.titulo }]
    : [];
}
