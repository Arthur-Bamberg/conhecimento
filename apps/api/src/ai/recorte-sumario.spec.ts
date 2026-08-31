import { describe, expect, it } from "vitest";
import { cortarSumario, recorteColecao, recorteSumario } from "./recorte-sumario";

describe("recorteSumario", () => {
  it("usa o primeiro parágrafo do corpo, limitado a 160 caracteres", () => {
    expect(recorteSumario("Título", "Reunião às 14h.\n\nDetalhes longos.")).toBe(
      "Reunião às 14h.",
    );
    expect(recorteSumario("Agenda", "")).toBe("Agenda");
    expect(cortarSumario("a".repeat(200)).length).toBe(160);
    expect(cortarSumario("a".repeat(200)).endsWith("…")).toBe(true);
  });
});

describe("recorteColecao", () => {
  it("junta os títulos e fica vazia sem textos", () => {
    expect(
      recorteColecao([
        { titulo: "Agenda da terça" },
        { titulo: "Receitas" },
      ]),
    ).toBe("Agenda da terça; Receitas");
    expect(recorteColecao([])).toBe("");
  });
});
