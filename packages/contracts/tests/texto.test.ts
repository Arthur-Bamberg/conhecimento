import { describe, expect, it } from "vitest";
import {
  createTextoSchema,
  patchTextoSchema,
  workspaceSchema,
} from "../src/index.js";

describe("createTextoSchema", () => {
  it("rejeita titulo vazio", () => {
    const result = createTextoSchema.safeParse({ titulo: "   ", corpo: "x" });
    expect(result.success).toBe(false);
  });

  it("preenche corpo vazio quando omitido", () => {
    const result = createTextoSchema.parse({ titulo: "Reunião" });
    expect(result.corpo).toBe("");
    expect(result.titulo).toBe("Reunião");
  });

  it("create e patch ignoram sumario enviado pelo cliente", () => {
    const created = createTextoSchema.parse({
      titulo: "Reunião",
      sumario: "não vale",
    });
    expect(created).not.toHaveProperty("sumario");

    const patched = patchTextoSchema.parse({
      corpo: "x",
      sumario: "não vale",
    });
    expect(patched).not.toHaveProperty("sumario");
  });
});

describe("workspaceSchema", () => {
  it("exige id, nome e sumario gerado", () => {
    const parsed = workspaceSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      nome: "Pessoal",
      sumario: "Agenda da terça; Receitas",
    });
    expect(parsed.sumario).toBe("Agenda da terça; Receitas");
  });
});
