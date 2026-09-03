import { describe, expect, it } from "vitest";
import { criarFiltroEscrita, extrairEscritas } from "./extrair-escritas";

describe("extrairEscritas", () => {
  it("separa a resposta visível do bloco de escrita", () => {
    const resposta = [
      "Vou gravar o caderno.",
      "",
      ":::escrita",
      JSON.stringify([
        {
          acao: "criar",
          titulo: "Caderno",
          corpo: "Notas da semana.",
        },
      ]),
      ":::",
    ].join("\n");

    const { visivel, propostas } = extrairEscritas(resposta);

    expect(visivel).toBe("Vou gravar o caderno.");
    expect(propostas).toEqual([
      {
        type: "escrita_proposta",
        acao: "criar",
        titulo: "Caderno",
        corpo: "Notas da semana.",
      },
    ]);
  });

  it("aceita um objeto único e alteração com textoId", () => {
    const resposta = [
      "Atualizei.",
      ":::escrita",
      JSON.stringify({
        acao: "alterar",
        textoId: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Receitas",
        corpo: "Bolo de cenoura.",
      }),
      ":::",
    ].join("\n");

    const { propostas } = extrairEscritas(resposta);
    expect(propostas).toEqual([
      {
        type: "escrita_proposta",
        acao: "alterar",
        textoId: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Receitas",
        corpo: "Bolo de cenoura.",
      },
    ]);
  });

  it("assume criar quando o JSON só traz titulo e corpo", () => {
    const resposta = [
      "Criei o tópico.",
      ":::escrita",
      JSON.stringify({
        titulo: "Configurar Landing Page Bamberg Software",
        corpo: "# Guia",
      }),
      ":::",
    ].join("\n");

    const { visivel, propostas } = extrairEscritas(resposta);
    expect(visivel).toBe("Criei o tópico.");
    expect(propostas).toEqual([
      {
        type: "escrita_proposta",
        acao: "criar",
        titulo: "Configurar Landing Page Bamberg Software",
        corpo: "# Guia",
      },
    ]);
  });

  it("ignora resposta sem bloco", () => {
    expect(extrairEscritas("Só uma pergunta.")).toEqual({
      visivel: "Só uma pergunta.",
      propostas: [],
    });
  });
});

describe("criarFiltroEscrita", () => {
  it("não vaza o bloco nos tokens mesmo fatiado", () => {
    const filtro = criarFiltroEscrita();
    const visivel: string[] = [];
    const chunks = [
      "Vou gravar.\n\n:::",
      "escrita\n",
      '[{"acao":"criar","titulo":"Caderno","corpo":"Notas."}]\n',
      ":::",
    ];
    for (const chunk of chunks) {
      const emit = filtro.push(chunk);
      if (emit) {
        visivel.push(emit);
      }
    }
    const fim = filtro.finish();
    if (fim.resto) {
      visivel.push(fim.resto);
    }

    expect(visivel.join("")).toBe("Vou gravar.\n\n");
    expect(fim.propostas).toEqual([
      {
        type: "escrita_proposta",
        acao: "criar",
        titulo: "Caderno",
        corpo: "Notas.",
      },
    ]);
  });
});
