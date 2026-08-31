import { describe, expect, it } from "vitest";
import { FakeAIProvider } from "./fake-ai.provider";

const agenda = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  titulo: "Agenda da terça",
  corpo: "Reunião às 14h com a Bruna.",
};
const receitas = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  titulo: "Receitas",
  corpo: "Bolo de chocolate com café.",
};

describe("FakeAIProvider", () => {
  it("cita o texto com maior overlap e emite fonte", async () => {
    const provider = new FakeAIProvider();
    const lines = [];
    for await (const line of provider.stream({
      pedido: "chocolate",
      textos: [agenda, receitas],
    })) {
      lines.push(line);
    }
    const tokens = lines.filter((l) => l.type === "token");
    const fontes = lines.filter((l) => l.type === "fonte");
    expect(tokens.map((l) => (l.type === "token" ? l.text : "")).join("")).toContain(
      "Receitas",
    );
    expect(tokens.map((l) => (l.type === "token" ? l.text : "")).join("")).toContain(
      "chocolate",
    );
    expect(fontes).toEqual([
      { type: "fonte", textoId: receitas.id, titulo: receitas.titulo },
    ]);
    expect(lines.at(-1)).toEqual({ type: "done" });
  });

  it("gera sumário pelo recorte do corpo", async () => {
    const sumario = await new FakeAIProvider().sumariar({
      titulo: "Agenda",
      corpo: "Reunião às 14h com a Bruna.\n\nOutros pontos.",
    });
    expect(sumario).toBe("Reunião às 14h com a Bruna.");
  });

  it("gera o sumário do workspace pelos títulos", async () => {
    const sumario = await new FakeAIProvider().sumariarColecao({
      textos: [
        { titulo: "Agenda da terça", recorte: "Reunião às 14h." },
        { titulo: "Receitas", recorte: "Bolo de chocolate." },
      ],
    });
    expect(sumario).toBe("Agenda da terça; Receitas");
  });
});
