import { describe, expect, it } from "vitest";
import { GeminiProvider } from "./gemini.provider";

describe("GeminiProvider", () => {
  it("emite erro claro sem chave", async () => {
    const previous = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const lines = [];
    for await (const line of new GeminiProvider().stream({
      pedido: "oi",
      textos: [],
    })) {
      lines.push(line);
    }
    expect(lines[0]).toMatchObject({
      type: "error",
      code: "MISSING_GEMINI_KEY",
    });
    if (previous !== undefined) {
      process.env.GEMINI_API_KEY = previous;
    }
  });
});
