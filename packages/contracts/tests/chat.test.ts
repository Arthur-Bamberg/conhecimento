import { describe, expect, it } from "vitest";
import { createMensagemSchema, streamLineSchema } from "../src/index.js";

describe("createMensagemSchema", () => {
  it("exige conteudo não vazio", () => {
    expect(createMensagemSchema.safeParse({ conteudo: "" }).success).toBe(false);
  });

  it("aceita textoIds uuid opcionais", () => {
    const parsed = createMensagemSchema.parse({
      conteudo: "Qual o horário?",
      textoIds: ["550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(parsed.textoIds).toHaveLength(1);
  });
});

describe("streamLineSchema", () => {
  it("aceita token, fonte, escrita, done e error", () => {
    expect(
      streamLineSchema.parse({ type: "token", text: "Olá" }),
    ).toMatchObject({ type: "token", text: "Olá" });
    expect(
      streamLineSchema.parse({
        type: "fonte",
        textoId: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Agenda",
      }),
    ).toMatchObject({ type: "fonte", titulo: "Agenda" });
    expect(
      streamLineSchema.parse({
        type: "escrita",
        acao: "criar",
        textoId: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Caderno",
      }),
    ).toMatchObject({ type: "escrita", acao: "criar", titulo: "Caderno" });
    expect(streamLineSchema.parse({ type: "done" }).type).toBe("done");
    expect(
      streamLineSchema.parse({
        type: "error",
        code: "PROVIDER_FAILED",
        message: "falhou",
      }),
    ).toMatchObject({ type: "error", code: "PROVIDER_FAILED" });
  });
});
