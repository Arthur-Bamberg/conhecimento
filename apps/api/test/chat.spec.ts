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

  it("título do chat vem do pedido e não cria texto", async () => {
    const server = app.getHttpServer();
    const textosAntes = await request(server).get("/api/textos").expect(200);
    const chat = await request(server).post("/api/chats").send({}).expect(201);
    await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({ conteudo: "ping-nao-vira-texto" })
      .expect(200);

    const detalhe = await request(server)
      .get(`/api/chats/${chat.body.id}`)
      .expect(200);
    expect(detalhe.body.titulo).toBe("ping-nao-vira-texto");

    const textosDepois = await request(server).get("/api/textos").expect(200);
    expect(textosDepois.body).toHaveLength(textosAntes.body.length);
    expect(
      textosDepois.body.some(
        (t: { titulo: string }) => t.titulo === "ping-nao-vira-texto",
      ),
    ).toBe(false);
  });

  it("cria um texto quando o pedido pede gravar", async () => {
    const server = app.getHttpServer();
    const chat = await request(server).post("/api/chats").send({}).expect(201);
    const res = await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({
        conteudo:
          "Crie um texto chamado Caderno de bordo com o corpo Notas da semana.",
      })
      .expect(200);

    const lines = parseNdjson(res.text);
    const escrita = lines.find((l) => l.type === "escrita");
    expect(escrita).toMatchObject({
      type: "escrita",
      acao: "criar",
      titulo: "Caderno de bordo",
    });

    const textos = await request(server).get("/api/textos").expect(200);
    const criado = textos.body.find(
      (t: { titulo: string }) => t.titulo === "Caderno de bordo",
    );
    expect(criado).toMatchObject({
      titulo: "Caderno de bordo",
      corpo: "Notas da semana.",
    });

    const detalhe = await request(server)
      .get(`/api/chats/${chat.body.id}`)
      .expect(200);
    expect(detalhe.body.mensagens[1].escritas[0]).toMatchObject({
      acao: "criar",
      titulo: "Caderno de bordo",
      textoId: criado.id,
    });
  });

  it("altera um texto existente quando o pedido pede alterar", async () => {
    const server = app.getHttpServer();
    const texto = await request(server)
      .post("/api/textos")
      .send({ titulo: "Receitas", corpo: "Bolo de chocolate com café." })
      .expect(201);
    const chat = await request(server).post("/api/chats").send({}).expect(201);
    const res = await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({
        conteudo: "Altere o texto Receitas para o corpo Bolo de cenoura.",
      })
      .expect(200);

    const lines = parseNdjson(res.text);
    expect(lines.find((l) => l.type === "escrita")).toMatchObject({
      type: "escrita",
      acao: "alterar",
      textoId: texto.body.id,
      titulo: "Receitas",
    });

    const atualizado = await request(server)
      .get(`/api/textos/${texto.body.id}`)
      .expect(200);
    expect(atualizado.body.corpo).toBe("Bolo de cenoura.");
  });

  it("cria um texto a partir de um pedido de tópico", async () => {
    const server = app.getHttpServer();
    const chat = await request(server).post("/api/chats").send({}).expect(201);
    const res = await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({
        conteudo:
          "Crie um novo tópico sobre configurar landing page bambergsoftware",
      })
      .expect(200);

    const escrita = parseNdjson(res.text).find((l) => l.type === "escrita");
    expect(escrita).toMatchObject({
      type: "escrita",
      acao: "criar",
      titulo: "Configurar landing page bambergsoftware",
    });

    const textos = await request(server).get("/api/textos").expect(200);
    expect(
      textos.body.some(
        (t: { titulo: string }) =>
          t.titulo === "Configurar landing page bambergsoftware",
      ),
    ).toBe(true);
  });

  it("segundo pedido mantém o título e o histórico persistido", async () => {
    const server = app.getHttpServer();
    const chat = await request(server).post("/api/chats").send({}).expect(201);
    await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({ conteudo: "primeira pergunta" })
      .expect(200);
    await request(server)
      .post(`/api/chats/${chat.body.id}/mensagens`)
      .send({ conteudo: "e depois disso?" })
      .expect(200);

    const detalhe = await request(server)
      .get(`/api/chats/${chat.body.id}`)
      .expect(200);
    expect(detalhe.body.titulo).toBe("primeira pergunta");
    expect(detalhe.body.mensagens.map((m: { role: string }) => m.role)).toEqual([
      "user",
      "assistant",
      "user",
      "assistant",
    ]);
    expect(detalhe.body.mensagens[0].conteudo).toBe("primeira pergunta");
    expect(detalhe.body.mensagens[2].conteudo).toBe("e depois disso?");
  });
});
