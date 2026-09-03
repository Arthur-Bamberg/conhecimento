import { describe, expect, it } from "vitest";
import type { AIProvider, StreamPedido } from "../ai/ai-provider";
import { ChatAiService } from "./chat-ai.service";

describe("ChatAiService", () => {
  it("envia o histórico anterior ao provider", async () => {
    const pedidos: StreamPedido[] = [];
    const provider: AIProvider = {
      async *stream(input) {
        pedidos.push(input);
        yield { type: "token", text: "ok" };
        yield { type: "done" };
      },
      async sumariar() {
        return "";
      },
      async sumariarColecao() {
        return "";
      },
    };
    const chats = {
      saveUserMessage: async () => ({}),
      saveAssistantMessage: async () => ({}),
      get: async () => ({
        mensagens: [
          { role: "user" as const, conteudo: "tem data?" },
          { role: "assistant" as const, conteudo: "Sim, no Grande dia." },
          { role: "user" as const, conteudo: "qual dia?" },
        ],
      }),
    };
    const textos = {
      list: async () => [
        { id: "1", titulo: "Grande dia", corpo: "01/01/2027" },
      ],
    };
    const service = new ChatAiService(
      chats as never,
      textos as never,
      provider,
      {
        gerar: async () => "",
        gerarColecao: async () => "",
      } as never,
      {
        atualizarSumario: async () => ({}),
      } as never,
    );

    const lines = [];
    for await (const line of service.responder("chat-1", {
      conteudo: "qual dia?",
    })) {
      lines.push(line);
    }

    expect(pedidos[0]?.pedido).toBe("qual dia?");
    expect(pedidos[0]?.historico).toEqual([
      { role: "user", conteudo: "tem data?" },
      { role: "assistant", conteudo: "Sim, no Grande dia." },
    ]);
    expect(lines.at(-1)).toEqual({ type: "done" });
  });
});
