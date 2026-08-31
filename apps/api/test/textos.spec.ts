import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { textoSchema } from "@conhecimento/contracts";
import { createApiApp } from "./create-api-app";

describe("textos HTTP", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApiApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("cria, lista, edita e remove um texto", async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post("/api/textos")
      .send({ titulo: "Agenda da terça", corpo: "Reunião às 14h." })
      .expect(201);
    const texto = textoSchema.parse(created.body);
    expect(texto.titulo).toBe("Agenda da terça");
    expect(texto.sumario).toBe("Reunião às 14h.");

    const listed = await request(server).get("/api/textos").expect(200);
    expect(listed.body).toHaveLength(1);

    const patched = await request(server)
      .patch(`/api/textos/${texto.id}`)
      .send({ corpo: "Reunião às 15h." })
      .expect(200);
    expect(patched.body.corpo).toBe("Reunião às 15h.");
    expect(patched.body.sumario).toBe("Reunião às 15h.");

    await request(server).delete(`/api/textos/${texto.id}`).expect(204);
    const empty = await request(server).get("/api/textos").expect(200);
    expect(empty.body).toHaveLength(0);
  });

  it("rejeita titulo vazio", async () => {
    await request(app.getHttpServer())
      .post("/api/textos")
      .send({ titulo: "  " })
      .expect(400)
      .expect((res) => {
        expect(res.body.error.code).toBe("VALIDATION");
      });
  });
});
