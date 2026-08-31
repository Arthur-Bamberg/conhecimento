import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Client } from "pg";
import { DataSource } from "typeorm";
import { ApiExceptionFilter } from "../src/http/api-exception.filter";

const URL_TESTE =
  "postgres://conhecimento:conhecimento@localhost:5433/conhecimento_test";

async function garantirBanco(url: string): Promise<void> {
  const parsed = new URL(url);
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!/^[a-z][a-z0-9_]*_test$/.test(dbName)) {
    throw new Error(
      `Testes recusam o banco "${dbName}". Use um DATABASE_URL *_test.`,
    );
  }
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const found = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (!found.rowCount) {
      await client.query(`CREATE DATABASE ${dbName}`);
    }
  } finally {
    await client.end();
  }
}

export async function createApiApp(): Promise<INestApplication> {
  process.env.DATABASE_URL = URL_TESTE;
  await garantirBanco(URL_TESTE);
  const { AppModule } = await import("../src/app.module");
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.init();
  const dataSource = app.get(DataSource);
  await dataSource.query(
    "TRUNCATE mensagens, chats, textos, workspaces RESTART IDENTITY CASCADE",
  );
  return app;
}
