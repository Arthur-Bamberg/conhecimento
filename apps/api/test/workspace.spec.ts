import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { workspaceSchema } from "@conhecimento/contracts";
import { createApiApp } from "./create-api-app";

describe("workspace HTTP", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApiApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("expõe o sumário do conjunto e atualiza quando os textos mudam", async () => {
    const server = app.getHttpServer();
    const vazio = await request(server).get("/api/workspace").expect(200);
    expect(workspaceSchema.parse(vazio.body).sumario).toBe("");

    await request(server)
      .post("/api/textos")
      .send({ titulo: "Agenda da terça", corpo: "Reunião às 14h." })
      .expect(201);
    await request(server)
      .post("/api/textos")
      .send({ titulo: "Receitas", corpo: "Bolo de chocolate." })
      .expect(201);

    const cheio = await request(server).get("/api/workspace").expect(200);
    const sumario = workspaceSchema.parse(cheio.body).sumario;
    expect(sumario).toContain("Agenda da terça");
    expect(sumario).toContain("Receitas");

    const listed = await request(server).get("/api/textos").expect(200);
    for (const texto of listed.body as { id: string }[]) {
      await request(server).delete(`/api/textos/${texto.id}`).expect(204);
    }
    const depois = await request(server).get("/api/workspace").expect(200);
    expect(workspaceSchema.parse(depois.body).sumario).toBe("");
  });
});
