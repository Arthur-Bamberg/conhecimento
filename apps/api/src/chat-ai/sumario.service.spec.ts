import { describe, expect, it } from "vitest";
import { SumarioService } from "./sumario.service";
import { FakeAIProvider } from "../ai/fake-ai.provider";

describe("SumarioService", () => {
  it("usa o provider e cai no recorte se vier vazio", async () => {
    const ok = new SumarioService(new FakeAIProvider());
    await expect(
      ok.gerar("Agenda", "Reunião às 14h.\n\nDetalhe."),
    ).resolves.toBe("Reunião às 14h.");

    const vazio = new SumarioService({
      stream: async function* () {},
      sumariar: async () => "",
      sumariarColecao: async () => "",
    });
    await expect(vazio.gerar("Agenda", "")).resolves.toBe("Agenda");
  });

  it("gera o sumário do workspace e cai no recorte se vier vazio", async () => {
    const ok = new SumarioService(new FakeAIProvider());
    await expect(
      ok.gerarColecao([
        { titulo: "Agenda da terça", corpo: "Reunião.", sumario: "Reunião." },
        { titulo: "Receitas", corpo: "Bolo.", sumario: "Bolo." },
      ]),
    ).resolves.toBe("Agenda da terça; Receitas");

    const vazio = new SumarioService({
      stream: async function* () {},
      sumariar: async () => "",
      sumariarColecao: async () => "",
    });
    await expect(
      vazio.gerarColecao([{ titulo: "Agenda", corpo: "", sumario: "" }]),
    ).resolves.toBe("Agenda");
    await expect(vazio.gerarColecao([])).resolves.toBe("");
  });
});
