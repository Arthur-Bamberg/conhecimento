import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { streamLineSchema } from "@conhecimento/contracts";
import { ChatAiService } from "../src/chat-ai/chat-ai.service";
import { createApiApp } from "./create-api-app";

function parseNdjson(text: string) {
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => streamLineSchema.parse(JSON.parse(line)));
}

describe("chat HTTP", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApiApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("não registra ChatAiService no bootstrap", () => {
    expect(() => app.get(ChatAiService)).toThrow(/does not exist/);
  });

  it("responde com NDJSON citando o texto certo", async () => {
    const server = app.getHttpServer();
    await request(server)
      .post("/api/textos")
      .send({ titulo: "Agenda da terça", corpo: "Reunião às 14h com a Bruna." })
      .expect(201);
    await request(server)
      .post("/api/textos")
      .send({ titulo: "Receitas", corpo: "Bolo de chocolate com café." })
      .expect(201);

    const chat = await request(server).post("/api/chats").send({}).expect(201);
    const res = await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({ conteudo: "chocolate" })
      .expect(200);

    const lines = parseNdjson(res.text);
    const texto = lines
      .filter((l) => l.type === "token")
      .map((l) => (l.type === "token" ? l.text : ""))
      .join("");
    expect(texto).toContain("Receitas");
    expect(texto).toContain("chocolate");
    const fonte = lines.find((l) => l.type === "fonte");
    expect(fonte?.type === "fonte" && fonte.titulo).toBe("Receitas");
    expect(lines.at(-1)?.type).toBe("done");

    const detalhe = await request(server)
      .get(`/api/chats/${chat.body.id}`)
      .expect(200);
    expect(detalhe.body.mensagens).toHaveLength(2);
    expect(detalhe.body.mensagens[1].fontes[0].titulo).toBe("Receitas");
  });
});
