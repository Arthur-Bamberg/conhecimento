# AGENTS.md — conhecimento

Guia para agentes (Cursor) neste repositório. Leia isto e [`CONTEXT.md`](./CONTEXT.md) antes de implementar.

## O que é

**conhecimento**: textos + chat com IA no browser; kanban entra na fatia B. Âncora: segundo cérebro de **Arthur Bamberg** primeiro; o mesmo núcleo vira oferta da **A Bamberg Desenvolvimento de Software** (Canoas/RS; CNPJ 63.801.318/0001-91; (51) 9978-4248).

MVP atual a implementar: **MVP-A — “Chat sobre os meus textos”**.

Programa (ordem): A → B (kanban + vínculo) → C (Cloud Run) → D (mobile).  
Docs de produto: Notion *[MVPs — Base de conhecimento + chat e kanban](https://app.notion.com/p/3cc169fdba5781e48b01f645a356e31a)* · quadro *[Kanban — Base de conhecimento](https://app.notion.com/p/2dec7c8716ba4ba08b8dbb3ee2469926)*.

Este plano **substitui** o recorte antigo em `personal/.scratch/feature-loop/plataforma-conhecimento` (páginas/blocos + ações generate/improve). Não copie aquele contrato.

## Repo e branch

- Path local: `/home/arthur/personal/conhecimento`
- GitHub: `Arthur-Bamberg/conhecimento` (privado)
- Branch default: **`main`** (não usar `master`)
- Glossário: `CONTEXT.md`
- Decisões por fatia: `.scratch/feature-loop/<slug>/decisions.md` (ainda não há — nasce no feature-loop da A)

## Fases de entrega (não misturar)

| Fatia | Objetivo | Inclui | Não inclui |
|-------|----------|--------|------------|
| **A** (agora) | Chat usa textos gravados | CRUD de **Texto**; **Chat** com contexto; Nest **lazy** (módulo chat/IA fora do bootstrap); Postgres compose; stream + **Fake** nos testes | Kanban, Cloud Run, mobile, RAG vetorial, auth multi-tenant |
| **B** | Segundo cérebro (fazer + saber) | Quadro + **vínculo** bidirecional task ↔ texto | Agente de projeto, deploy |
| **C** | Uso fora da máquina | Cloud Run + Postgres gerenciado + HTTPS | Multi-tenant, lojas |
| **D** | No bolso | Cliente mobile no mesmo contrato | Publicação nas lojas obrigatória no 1º corte |

## Stack (o que já está fechado vs aberto)

| Camada | Estado |
|--------|--------|
| Backend | **NestJS** com **lazy load** de módulos (chat/IA) |
| Persistência | **PostgreSQL** (compose na A; gerenciado na C) |
| Deploy | **Google Cloud Run** na **C**, não como prova da A |
| Superfície A | **Web desktop (browser)** |
| Cliente web | **Aberto:** Expo Web vs Next.js — fechar no feature-loop da A |
| Corpo do texto | **Aberto:** markdown simples vs blocos |
| Stream | **Aberto:** NDJSON vs SSE — fechar no feature-loop da A |
| Provider runtime | Plugável; **Fake** em teste/e2e/CI — **nunca** LLM real no CI |
| Pacotes | Esperado **pnpm** + monorepo quando a A existir; não scaffoldar `apps/` vazios |
| Testes | Unit na API/contratos; e2e **Playwright** no browser com FakeAI |
| Locale | **pt-BR** na UI de produto |
| Auth | Fora de A–B; mínima na C se precisar (não multi-tenant) |

Não crie `apps/api` / `apps/app` até o feature-loop da A. Não misture com `orquestrador-ofertas-supermercados`.

## Pipeline por fatia (`/feature-loop`)

A IA **não troca o modelo sozinho**. Se o chat estiver no modelo errado: *“Troque o modelo para \<modelo\> e confirme para eu continuar.”*

| Fase | Modelo |
|------|--------|
| Decisões / plano / review | Grok 4.5 High |
| TDD + impl | Composer 2.5 |
| E2E caminho feliz | testes locais **sem IA** (provider falso) |

**Não** usar GPT-5.4 Nano como agente principal.

1. Decisões em lote → `decisions.md`
2. Confirmação humana
3. TDD + impl
4. Review standards + spec
5. Suite local (format/lint/typecheck/unit)
6. E2E local sem IA
7. Caminho feliz manual (Arthur Bamberg no browser)

Mesma assinatura de erro 2× → parar.

## Critérios de sucesso (MVP-A)

- 1 caminho feliz e2e local verde **sem** LLM real
- Demo manual: 2 textos; pergunta que só um responde; a UI mostra resposta (stub/real) e o texto de origem
- Evidência de lazy load Nest (módulo de chat/IA fora do grafo estático inicial)
- Compose sobe API + Postgres; o front **não** recebe chave de LLM
