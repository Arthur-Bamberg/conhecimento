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
    const texto = tokens.map((l) => (l.type === "token" ? l.text : "")).join("");
    expect(texto).toContain("Com base no texto **Receitas**");
    expect(texto).toContain("chocolate");
    expect(fontes).toEqual([
      { type: "fonte", textoId: receitas.id, titulo: receitas.titulo },
    ]);
    expect(lines.at(-1)).toEqual({ type: "done" });
  });

  it("emite escrita_proposta ao criar um texto", async () => {
    const provider = new FakeAIProvider();
    const lines = [];
    for await (const line of provider.stream({
      pedido:
        "Crie um texto chamado Caderno de bordo com o corpo Notas da semana.",
      textos: [],
    })) {
      lines.push(line);
    }
    const texto = lines
      .filter((l) => l.type === "token")
      .map((l) => (l.type === "token" ? l.text : ""))
      .join("");
    expect(texto).toContain("Caderno de bordo");
    expect(lines).toContainEqual({
      type: "escrita_proposta",
      acao: "criar",
      titulo: "Caderno de bordo",
      corpo: "Notas da semana.",
    });
    expect(lines.some((l) => l.type === "fonte")).toBe(false);
    expect(lines.at(-1)).toEqual({ type: "done" });
  });

  it("grava um tópico pedido em linguagem natural", async () => {
    const provider = new FakeAIProvider();
    const lines = [];
    for await (const line of provider.stream({
      pedido:
        "Crie um novo tópico sobre configurar landing page bambergsoftware",
      textos: [agenda],
    })) {
      lines.push(line);
    }
    expect(lines).toContainEqual({
      type: "escrita_proposta",
      acao: "criar",
      titulo: "Configurar landing page bambergsoftware",
      corpo: [
        "# Configurar landing page bambergsoftware",
        "",
        "Crie um novo tópico sobre configurar landing page bambergsoftware",
      ].join("\n"),
    });
  });

  it("emite escrita_proposta ao alterar um texto do contexto", async () => {
    const provider = new FakeAIProvider();
    const lines = [];
    for await (const line of provider.stream({
      pedido: "Altere o texto Receitas para o corpo Bolo de cenoura.",
      textos: [agenda, receitas],
    })) {
      lines.push(line);
    }
    expect(lines).toContainEqual({
      type: "escrita_proposta",
      acao: "alterar",
      textoId: receitas.id,
      titulo: receitas.titulo,
      corpo: "Bolo de cenoura.",
    });
    expect(lines).toContainEqual({
      type: "fonte",
      textoId: receitas.id,
      titulo: receitas.titulo,
    });
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
