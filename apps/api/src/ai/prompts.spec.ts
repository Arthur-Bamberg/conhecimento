import { describe, expect, it } from "vitest";
import {
  INSTRUCAO_CHAT,
  montarPromptChat,
  montarPromptColecao,
  montarPromptSumario,
} from "./prompts";

describe("prompts de chat", () => {
  it("pede resposta elaborada em markdown e inclui textos, pedido e histórico", () => {
    expect(INSTRUCAO_CHAT).toMatch(/markdown/i);
    expect(INSTRUCAO_CHAT).toMatch(/completa|útil|elaborad/i);

    const prompt = montarPromptChat({
      pedido: "Qual o dia especial?",
      textos: [
        {
          titulo: "Grande dia",
          corpo: "O dia especial é 01/01/2027.",
        },
      ],
      historico: [
        { role: "user", conteudo: "tem alguma data marcada?" },
        { role: "assistant", conteudo: "Sim, no texto Grande dia." },
      ],
    });

    expect(prompt).toContain("Grande dia");
    expect(prompt).toContain("O dia especial é 01/01/2027.");
    expect(prompt).toContain("Qual o dia especial?");
    expect(prompt).toContain("tem alguma data marcada?");
  });
});

describe("prompts de sumário", () => {
  it("pede síntese, não recorte cru do primeiro parágrafo", () => {
    const sumario = montarPromptSumario(
      "Receita de pudim",
      "Leite condensado, leite, ovos e açúcar.",
    );
    expect(sumario).toContain("Receita de pudim");
    expect(sumario).toMatch(/síntese|sintetiz|frase clara/i);
    expect(sumario).toMatch(/não copie/i);

    const colecao = montarPromptColecao([
      { titulo: "Receita de pudim", recorte: "Leite condensado no forno." },
      { titulo: "Grande dia", recorte: "01/01/2027." },
    ]);
    expect(colecao).toContain("Receita de pudim");
    expect(colecao).toContain("Grande dia");
    expect(colecao).toMatch(/sintetiz|conjunto|temas/i);
  });
});
