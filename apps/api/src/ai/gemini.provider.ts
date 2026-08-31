import { GoogleGenerativeAI } from "@google/generative-ai";
import type { StreamLine } from "@conhecimento/contracts";
import type {
  AIProvider,
  StreamPedido,
  SumariarColecaoPedido,
  SumariarPedido,
} from "./ai-provider";
import { recorteColecao, recorteSumario } from "./recorte-sumario";
import { resolverFontes } from "./resolver-fontes";

export class GeminiProvider implements AIProvider {
  async *stream(input: StreamPedido): AsyncIterable<StreamLine> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      yield {
        type: "error",
        code: "MISSING_GEMINI_KEY",
        message: "GEMINI_API_KEY não configurada.",
      };
      return;
    }
    const modelName = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const genai = new GoogleGenerativeAI(key);
    const model = genai.getGenerativeModel({ model: modelName });
    const blocos = input.textos
      .map((t) => `## ${t.titulo}\n${t.corpo}`)
      .join("\n\n");
    const prompt = `Você responde com base só nos textos abaixo. Cite o título do texto usado.\n\nTextos:\n${blocos}\n\nPedido:\n${input.pedido}`;
    try {
      const result = await model.generateContentStream(prompt);
      let resposta = "";
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          resposta += text;
          yield { type: "token", text };
        }
      }
      for (const fonte of resolverFontes({
        resposta,
        pedido: input.pedido,
        textos: input.textos,
      })) {
        yield {
          type: "fonte",
          textoId: fonte.textoId,
          titulo: fonte.titulo,
        };
      }
      yield { type: "done" };
    } catch (err) {
      yield {
        type: "error",
        code: "GEMINI_FAILED",
        message: err instanceof Error ? err.message : "Falha no Gemini.",
      };
    }
  }

  async sumariar(input: SumariarPedido): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return recorteSumario(input.titulo, input.corpo);
    }
    const modelName = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const genai = new GoogleGenerativeAI(key);
    const model = genai.getGenerativeModel({ model: modelName });
    const prompt = [
      "Resuma o texto abaixo numa única frase em português brasileiro.",
      "Sem markdown, sem aspas, no máximo 160 caracteres.",
      "Responda só com o sumário.",
      "",
      `Título: ${input.titulo}`,
      "",
      input.corpo,
    ].join("\n");
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  async sumariarColecao(input: SumariarColecaoPedido): Promise<string> {
    if (input.textos.length === 0) {
      return "";
    }
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return recorteColecao(input.textos);
    }
    const modelName = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const genai = new GoogleGenerativeAI(key);
    const model = genai.getGenerativeModel({ model: modelName });
    const blocos = input.textos
      .map((t) => `- ${t.titulo}: ${t.recorte || t.titulo}`)
      .join("\n");
    const prompt = [
      "Resuma o conjunto de textos abaixo em 1 ou 2 frases em português brasileiro.",
      "Diga o que a pessoa tem gravado. Sem markdown, sem aspas, no máximo 280 caracteres.",
      "Responda só com o sumário.",
      "",
      blocos,
    ].join("\n");
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }
}
