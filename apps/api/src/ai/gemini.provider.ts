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
import {
  INSTRUCAO_CHAT,
  montarPromptChat,
  montarPromptColecao,
  montarPromptSumario,
} from "./prompts";

function modelo(key: string, systemInstruction?: string, maxOutputTokens = 8192) {
  const genai = new GoogleGenerativeAI(key);
  return genai.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
    systemInstruction,
    generationConfig: {
      temperature: systemInstruction ? 0.75 : 0.4,
      maxOutputTokens,
    },
  });
}

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
    const prompt = montarPromptChat({
      pedido: input.pedido,
      textos: input.textos,
      historico: input.historico,
    });
    try {
      const result = await modelo(key, INSTRUCAO_CHAT).generateContentStream(
        prompt,
      );
      let resposta = "";
      for await (const chunk of result.stream) {
        let text = "";
        try {
          text = chunk.text();
        } catch {
          continue;
        }
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
    const result = await modelo(key, undefined, 2048).generateContent(
      montarPromptSumario(input.titulo, input.corpo),
    );
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
    const result = await modelo(key, undefined, 2048).generateContent(
      montarPromptColecao(input.textos),
    );
    return result.response.text().trim();
  }
}
