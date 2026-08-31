import { describe, expect, it } from "vitest";
import { resolverFontes } from "./resolver-fontes";

const pudim = {
  id: "11111111-1111-1111-1111-111111111111",
  titulo: "Receita de pudim",
  corpo: "Leite condensado e forno baixo.",
};
const grandeDia = {
  id: "22222222-2222-2222-2222-222222222222",
  titulo: "Grande dia",
  corpo: "O dia especial é 01/01/2027.",
};
const receitas = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  titulo: "Receitas",
  corpo: "Bolo de chocolate com café.",
};

describe("resolverFontes", () => {
  it("cita o texto cujo título aparece na resposta, não o primeiro do contexto", () => {
    const fontes = resolverFontes({
      resposta:
        "O dia especial (grande dia) é **01/01/2027**.\n\n**Texto usado:** Grande dia",
      pedido: "Qual o dia especial?",
      textos: [pudim, grandeDia],
    });
    expect(fontes).toEqual([
      { textoId: grandeDia.id, titulo: grandeDia.titulo },
    ]);
  });

  it("cai no overlap do pedido se a resposta não citar título", () => {
    const fontes = resolverFontes({
      resposta: "O bolo leva café.",
      pedido: "chocolate",
      textos: [pudim, receitas],
    });
    expect(fontes).toEqual([
      { textoId: receitas.id, titulo: receitas.titulo },
    ]);
  });
});
