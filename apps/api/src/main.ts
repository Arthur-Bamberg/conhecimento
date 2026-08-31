import "reflect-metadata";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./http/api-exception.filter";

function loadRepoEnv(): string | undefined {
  const starts = [process.cwd(), dirname(fileURLToPath(import.meta.url))];
  const seen = new Set<string>();
  for (const start of starts) {
    let dir = start;
    for (let i = 0; i < 8; i++) {
      const file = resolve(dir, ".env");
      if (!seen.has(file) && existsSync(file)) {
        process.loadEnvFile(file);
        return file;
      }
      seen.add(file);
      const parent = dirname(dir);
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
  }
  return undefined;
}

loadRepoEnv();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  });
  app.useGlobalFilters(new ApiExceptionFilter());
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
