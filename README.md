# conhecimento

Base de conhecimento (textos) + **chat com IA**, com kanban na fatia B. Segundo cérebro de **Arthur Bamberg**; o mesmo núcleo vira oferta da **A Bamberg Desenvolvimento de Software** (tecnologia, Canoas/RS; CNPJ 63.801.318/0001-91; tel. (51) 9978-4248).

- Plano de MVPs: [MVPs — Base de conhecimento + chat e kanban](https://app.notion.com/p/3cc169fdba5781e48b01f645a356e31a)
- Kanban: [Kanban — Base de conhecimento](https://app.notion.com/p/2dec7c8716ba4ba08b8dbb3ee2469926)
- Para agentes: [`AGENTS.md`](./AGENTS.md)
- Glossário: [`CONTEXT.md`](./CONTEXT.md)

## Status

**MVP-A** entregue (chat + textos na web, Nest lazy, Postgres). Decisões: `.scratch/feature-loop/mvp-a-chat-textos/decisions.md`.

Ordem das fatias: **A → B → C → D**.

| Fatia | O quê |
|-------|--------|
| **A** | Chat + textos na web; NestJS lazy; Postgres local |
| **B** | Kanban + vínculo bidirecional task ↔ texto |
| **C** | Cloud Run + Postgres gerenciado |
| **D** | Mobile sobre o mesmo contrato HTTP |

## Comandos

```bash
cp .env.example .env
pnpm install
docker compose up --build      # Postgres :5433 + API :3001
pnpm --filter @conhecimento/web dev   # http://localhost:3000
pnpm test
pnpm e2e                       # Playwright, AI_PROVIDER=fake
```

Gemini no runtime: `AI_PROVIDER=gemini` e `GEMINI_API_KEY` no `.env` (só na API). E2E e `pnpm test` usam Fake.
