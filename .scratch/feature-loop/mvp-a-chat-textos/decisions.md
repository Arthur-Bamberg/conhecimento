# Decisões — MVP-A chat + textos

## Contexto

Greenfield no repo `conhecimento`: chat web sobre **Textos** (título + corpo), NestJS lazy, Postgres local. O usuário pediu para **aceitar as questões em aberto da A** (recomendações) e implementar. Recorte antigo (páginas/blocos + apply) está fora.

## Lista

### D1 — Forma do monorepo
- **Pergunta:** Como empacotar API, web e contratos?
- **Opções:**
  - A: **pnpm** workspaces, Node 22, `apps/api` (Nest), `apps/web` (Next.js), `packages/contracts` (Zod), `docker-compose.yml` (PostgreSQL)
  - B: Dois git repos
  - C: Só API agora
- **Recomendado:** A — um git, um contrato, compose para a prova local.
- **Status:** confirmado

### D2 — Cliente web da A
- **Pergunta:** Expo Web ou Next.js?
- **Opções:**
  - A: **Next.js** App Router; mobile (Expo) na fatia D sobre o mesmo contrato HTTP
  - B: Expo Web desde a A (mesmo código até D)
  - C: Vite SPA
- **Recomendado:** A — o demo da A é chat + edição no desktop; Playwright e markdown são naturais no Next; D não fica travada se `packages/contracts` for a fonte do HTTP.
- **Depende de:** D1.
- **Status:** confirmado

### D3 — Corpo do Texto
- **Pergunta:** Markdown, blocos ou HTML?
- **Opções:**
  - A: **Markdown** como `string` (`titulo` + `corpo`)
  - B: Lista de blocos (recorte antigo)
  - C: HTML rico
- **Recomendado:** A — chat-first não precisa de editor Notion-like; textarea + render markdown.
- **Status:** confirmado

### D4 — Persistência e workspace
- **Pergunta:** Onde persiste Texto/Chat e como não travar tenancy depois?
- **Opções:**
  - A: **PostgreSQL + TypeORM** (migrations). Entidade `Workspace` (seed único “Pessoal”). `workspaceId` em Texto, Chat e Mensagem. Rotas **sem** `workspaceId` — o servidor usa o seed. IDs UUID. Sem tabela `User` na A.
  - B: Prisma + Postgres
  - C: SQLite
- **Recomendado:** A — Nest com entities/repositories; Prisma seria troca sem ganho na A; SQLite piora a C (Cloud SQL).
- **Depende de:** D1.
- **Status:** confirmado

### D5 — Contratos
- **Pergunta:** Onde vivem os tipos HTTP e do stream?
- **Opções:**
  - A: `packages/contracts` com **Zod**; API valida, web infere
  - B: class-validator só no Nest
  - C: OpenAPI gerado
- **Recomendado:** A — uma fonte para textos, chat e linhas NDJSON.
- **Depende de:** D1.
- **Status:** confirmado

### D6 — Transporte do stream
- **Pergunta:** NDJSON, SSE ou WebSocket?
- **Opções:**
  - A: `POST /api/chats/:id/mensagens` com JSON no body; resposta **NDJSON** (`fetch` + ReadableStream). Linhas: `{ type: "token", text }`, `{ type: "fonte", textoId, titulo }`, `{ type: "done" }` | `{ type: "error", code, message }`
  - B: EventSource (SSE, GET)
  - C: WebSocket
- **Recomendado:** A — o pedido precisa de `conteudo` e `textoIds` no body; SSE GET não carrega isso sem gambiarra; WS é superfície extra.
- **Depende de:** D2, D5.
- **Status:** confirmado

### D7 — Provider
- **Pergunta:** Quem gera tokens em runtime vs testes?
- **Opções:**
  - A: Porta `AIProvider`. Runtime **Gemini** (`GEMINI_API_KEY`, modelo default `gemini-2.5-flash`). Testes/e2e/CI: **FakeAIProvider** via `AI_PROVIDER=fake`. Chave **só** no backend. `NEXT_PUBLIC_*` nunca leva credencial.
  - B: Sempre Gemini (também no CI)
  - C: OpenAI como default
- **Recomendado:** A — CI determinístico; Gemini é o runtime pessoal já usado noutros projetos.
- **Status:** confirmado

### D8 — Como montar o contexto
- **Pergunta:** Quais textos entram na chamada?
- **Opções:**
  - A: Body com `textoIds` opcional. Se vier lista, usa esses. Se vazio: **busca lexical** (palavras do pedido em `titulo` ou `corpo`, ILIKE, AND entre tokens). Se zero hits, inclui textos do workspace até o orçamento (**8000** caracteres: meta + corpos + pedido). Sem embeddings.
  - B: Sempre todos os textos
  - C: RAG vetorial
- **Recomendado:** A — o e2e (“pergunta que só um responde”) precisa de lexical + **fontes**; fallback ao orçamento cobre pergunta conversacional sem keyword.
- **Depende de:** D7.
- **Status:** confirmado

### D9 — Chat persistido
- **Pergunta:** O histórico sobrevive a F5?
- **Opções:**
  - A: Recursos `Chat` e `Mensagem` (roles `user` | `assistant`). Fontes ficam na mensagem do assistente (`textoId` + `titulo`). `POST /api/chats`, `GET /api/chats`, `GET /api/chats/:id`, `POST /api/chats/:id/mensagens`.
  - B: Só stream, sem persistir
  - C: Um chat global único
- **Recomendado:** A — B mente após reload; C impede várias conversas cedo demais mas a UI da A pode criar um chat ao entrar em `/chat` se a lista estiver vazia.
- **Depende de:** D4.
- **Status:** confirmado

### D10 — Lazy load Nest
- **Pergunta:** O que fica fora do bootstrap?
- **Opções:**
  - A: `AppModule` **não** importa `ChatModule`. `ChatHostModule` (estático) expõe o controller e, no primeiro `POST .../mensagens`, `LazyModuleLoader` carrega `ChatModule` (serviço + `AIProvider` + SDK Gemini). Teste: `ChatService` / provider ausentes no grafo inicial.
  - B: Tudo estático
  - C: Lazy de TypeORM inteiro
- **Recomendado:** A — critério de sucesso da A; C é teatro.
- **Depende de:** D7, D9.
- **Status:** confirmado

### D11 — HTTP
- **Pergunta:** Prefixo, auth, erros, CORS?
- **Opções:**
  - A: Prefixo `/api`, sem versão na URL, **sem Authorization**. CORS ao origin do Next (`http://localhost:3000`). Erros `{ error: { code, message } }` (`message` pt-BR, `code` estável em inglês). API na porta **3001**.
  - B: `/v1` + JWT stub
  - C: GraphQL
- **Recomendado:** A — auth é C/depois; JWT stub treina o cliente na mentira.
- **Status:** confirmado

### D12 — CRUD de Texto
- **Pergunta:** Superfície de textos?
- **Opções:**
  - A: `GET/POST /api/textos`, `GET/PATCH/DELETE /api/textos/:id`. Create exige `titulo` (não vazio). `corpo` default `""`. Lista plana, mais recentes primeiro. Delete permitido mesmo se citado (fonte guarda id+titulo copiados).
  - B: Só create/list
  - C: Nested `/workspaces/:id/textos`
- **Recomendado:** A — o demo precisa editar e o e2e precisa de dois textos estáveis.
- **Depende de:** D3, D4.
- **Status:** confirmado

### D13 — FakeAI
- **Pergunta:** O que o provider falso emite?
- **Opções:**
  - A: Escolhe o texto do contexto com **maior overlap** de palavras com o pedido; faz stream de tokens `Segundo o texto "{titulo}": {trecho}` (trecho = primeiras ~200 chars do corpo, ou título se corpo vazio); emite `fonte` desse texto; depois `done`. Sem parse de sentinela.
  - B: Resposta fixa sem citar texto
  - C: Segunda chamada JSON
- **Recomendado:** A — o e2e asserta citação/origem sem LLM.
- **Depende de:** D6, D8.
- **Status:** confirmado

### D14 — UI
- **Pergunta:** Quais rotas e estado?
- **Opções:**
  - A: Next App Router, pt-BR. Nav: **Textos** | **Chat**. `/textos` lista+criar; `/textos/[id]` edita (textarea). `/chat` lista conversas à esquerda (mínimo) e thread; se não houver chat, cria um. TanStack Query para CRUD; stream do chat em estado local da feature. Markdown renderizado na leitura; no editor, textarea cru.
  - B: Uma página única
  - C: Redux global
- **Recomendado:** A — cache de lista sem store-deus; proposta/stream é efêmero até `done`.
- **Depende de:** D2, D9.
- **Status:** confirmado

### D15 — Testes
- **Pergunta:** Runners da A?
- **Opções:**
  - A: **Vitest** em `packages/contracts` e `apps/api`. **Playwright** em `apps/web` (caminho feliz, `AI_PROVIDER=fake`). API de teste sobe com Postgres do compose (db `conhecimento_test` ou o mesmo local com truncate). CI não chama Gemini.
  - B: Jest no Nest default
  - C: Sem e2e
- **Recomendado:** A — AGENTS.md já pede Vitest + Playwright.
- **Depende de:** D2, D7.
- **Status:** confirmado

### D16 — Compose e env
- **Pergunta:** O que o compose sobe na A?
- **Opções:**
  - A: **Postgres 16 + api** (Dockerfile em `apps/api`). Web no host (`pnpm --filter web`). `DATABASE_URL` (`postgres` no compose, `localhost` no host), `AI_PROVIDER`, `GEMINI_API_KEY`, `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL`.
  - B: Compose com api+web+postgres
  - C: Só Postgres; API só no host
- **Recomendado:** A — o critério de sucesso pede compose API+Postgres; web no host simplifica Playwright `webServer`.
- **Status:** confirmado

### D17 — Sumário do Texto
- **Pergunta:** Quem escreve o recorte que aparece na lista de textos?
- **Opções:**
  - A: A pessoa preenche **descrição** no create/edit; o recorte vai no `corpo` (primeiro parágrafo)
  - B: A **IA gera** um **Sumário** persistido (`sumario`); create/edit só têm título + corpo; o cliente não envia `sumario`
  - C: Recorte local do `corpo` (primeiros caracteres), sem IA
- **Recomendado:** B — o pedido é a IA gerir o sumário; misturar recorte no `corpo` polui o contexto do chat e o editor. Fake/recorte local só como fallback se o provider falhar.
- **Depende de:** D3, D7, D10, D12.
- **Status:** confirmado

### D18 — Sumário do workspace
- **Pergunta:** Como mostrar uma síntese de todos os textos?
- **Opções:**
  - A: **Persistir `sumario` no Workspace**; regenerar no create/patch/delete de Texto; `GET /api/workspace`; a lista mostra o recorte; a pessoa não edita
  - B: Recalcular com o provider em todo `GET /textos`
  - C: O cliente concatena os sumários de cada texto
- **Recomendado:** A — B chama o provider a cada abertura da lista; C não sintetiza e foge do mesmo padrão do Sumário do Texto. Fake/recorte pelos títulos só como fallback.
- **Depende de:** D4, D7, D12, D17.
- **Status:** confirmado

## Revisão global

- Data/hora da passagem 2: 2026-08-30 ~13:35 America/Sao_Paulo
- O que mudou vs passagem 1:
  - D2 Next.js (não Expo): a âncora da A é desktop; Expo Web atrasaria o chat sem entregar D.
  - D8: lexical + fallback ao orçamento (não só “anexar tudo” nem só lexical vazio).
  - D10: controller estático + módulo de chat/IA lazy — rotas existem no bootstrap, SDK não.
  - D13: overlap determinístico no Fake — o e2e não depende de parse Gemini.
  - D16: compose = Postgres **e** API (não só Postgres), para bater o critério de sucesso; web continua fora.
- Riscos remanescentes:
  - Gemini real pode ignorar “cite o texto”; Fake cobre o e2e; demo manual com chave é best-effort.
  - LazyModuleLoader + TypeORM no módulo lazy: `ChatModule` usa `TypeOrm.forFeature` das entidades de chat na mesma conexão.
- ADRs: Next.js não Expo; POST+NDJSON; markdown não blocos; ChatModule lazy; sumário pela IA.
