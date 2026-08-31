import { describe, expect, it } from "vitest";
import { montarContexto } from "./context-builder";

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

describe("montarContexto", () => {
  it("usa só os textos pedidos em textoIds", () => {
    const result = montarContexto({
      pedido: "horário",
      textos: [agenda, receitas],
      textoIds: [agenda.id],
    });
    expect(result.textos.map((t) => t.id)).toEqual([agenda.id]);
  });

  it("escolhe por overlap lexical e cai no orçamento se nada bater", () => {
    const lexical = montarContexto({
      pedido: "chocolate",
      textos: [agenda, receitas],
    });
    expect(lexical.textos.map((t) => t.id)).toEqual([receitas.id]);

    const fallback = montarContexto({
      pedido: "oi",
      textos: [agenda, receitas],
    });
    expect(fallback.textos).toHaveLength(2);
  });
});
