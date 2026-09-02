import { Client } from "pg";

const PADRAO =
  "postgres://conhecimento:conhecimento@localhost:5433/conhecimento_e2e_test";

function bancoDeTeste() {
  const url = process.env.DATABASE_URL ?? PADRAO;
  const parsed = new URL(url);
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!/^[a-z][a-z0-9_]*_test$/.test(dbName)) {
    throw new Error(
      `E2E recusa o banco "${dbName}". Use um DATABASE_URL *_test.`,
    );
  }
  return { url, dbName };
}

async function ensureFresh() {
  const { url, dbName } = bancoDeTeste();
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    await client.query(`CREATE DATABASE ${dbName}`);
  } finally {
    await client.end();
  }
}

if (process.argv[2] !== "ensure-fresh") {
  throw new Error("use: ensure-fresh");
}
await ensureFresh();
