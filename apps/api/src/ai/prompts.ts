import type { TextoContexto } from "./context-builder";

export type TurnoHistorico = {
  role: "user" | "assistant";
  conteudo: string;
};

export const INSTRUCAO_CHAT = [
  "Você é o assistente do segundo cérebro da pessoa: responde a partir dos textos gravados.",
  "Escreva em português brasileiro uma resposta completa e útil — não um recorte cru do texto.",
  "Estruture com markdown (títulos curtos, listas, negrito nos pontos-chave) quando ajudar a leitura.",
  "Explique o que os textos dizem, organize os fatos e, se fizer sentido, indique o próximo passo.",
  "Cite o título exato de cada texto em que se apoiou. Não invente o que não estiver nos textos.",
  "Se os textos não cobrirem o pedido, diga o que falta e o que ainda dá para afirmar.",
].join(" ");

export function montarPromptChat(input: {
  pedido: string;
  textos: Pick<TextoContexto, "titulo" | "corpo">[];
  historico?: TurnoHistorico[];
}): string {
  const blocos =
    input.textos.length > 0
      ? input.textos.map((t) => `## ${t.titulo}\n${t.corpo}`).join("\n\n")
      : "(nenhum texto no contexto)";
  const turnos = (input.historico ?? [])
    .map(
      (t) =>
        `${t.role === "user" ? "Pessoa" : "Assistente"}: ${t.conteudo}`,
    )
    .join("\n\n");
  const partes = ["Textos:", blocos];
  if (turnos) {
    partes.push("Turnos anteriores:", turnos);
  }
  partes.push("Pedido atual:", input.pedido);
  return partes.join("\n\n");
}

export function montarPromptSumario(titulo: string, corpo: string): string {
  return [
    "Escreva uma síntese em uma frase clara, em português brasileiro.",
    "Diga o que o texto contém; não copie o primeiro parágrafo.",
    "Sem markdown, sem aspas, no máximo 160 caracteres.",
    "Responda só com o sumário.",
    "",
    `Título: ${titulo}`,
    "",
    corpo,
  ].join("\n");
}

export function montarPromptColecao(
  textos: { titulo: string; recorte: string }[],
): string {
  const blocos = textos
    .map((t) => `- ${t.titulo}: ${t.recorte || t.titulo}`)
    .join("\n");
  return [
    "Sintetize o conjunto em 1 ou 2 frases em português brasileiro.",
    "Agrupe temas: o que a pessoa tem gravado. Não liste títulos separados por ponto e vírgula.",
    "Sem markdown, sem aspas, no máximo 280 caracteres.",
    "Responda só com o sumário.",
    "",
    blocos,
  ].join("\n");
}
