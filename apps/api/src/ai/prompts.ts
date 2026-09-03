import type { TextoContexto } from "./context-builder";

export type TurnoHistorico = {
  role: "user" | "assistant";
  conteudo: string;
};

export const INSTRUCAO_CHAT = [
  "Você é o assistente do segundo cérebro da pessoa.",
  "Escreva em português brasileiro uma resposta completa e útil, com markdown quando ajudar a leitura.",
  "Pergunta: responda a partir dos textos gravados; cite o título exato; se não cobrirem o pedido, diga o que falta — não invente fatos como se já estivessem gravados.",
  "Gravação: se a pessoa pedir para criar, gravar, escrever, anotar ou abrir um texto, tópico ou nota, grave um Texto — mesmo que nenhum texto atual cubra o assunto.",
  "Nesse caso escreva um corpo em markdown útil a partir do pedido e, no final, emita um único bloco :::escrita com JSON que inclua acao (criar ou alterar), titulo e corpo.",
  "Não recuse a gravação por falta de fonte. Não invente ids. Só emita o bloco quando o pedido for gravar.",
].join(" ");

export function montarPromptChat(input: {
  pedido: string;
  textos: Pick<TextoContexto, "id" | "titulo" | "corpo">[];
  historico?: TurnoHistorico[];
}): string {
  const blocos =
    input.textos.length > 0
      ? input.textos
          .map((t) => `## ${t.titulo}\n(id: ${t.id})\n${t.corpo}`)
          .join("\n\n")
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
