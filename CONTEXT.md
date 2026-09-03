# Conhecimento

Textos organizados num workspace, usados principalmente por **chat com IA**. Kanban e vínculo com tarefas entram na fatia B. Segundo cérebro pessoal de Arthur Bamberg; o núcleo é o que a Bamberg Desenvolvimento de Software pode oferecer depois.

## Language

**Texto**:
Unidade de conhecimento: `titulo`, `corpo` (markdown) e `sumario`, no workspace. Na fatia A é a única peça persistida de produto além do chat.
_Avoid_: Página (recorte antigo), nota, documento, artigo, post, bloco, arquivo

**Sumário**:
Recorte curto de um Texto, gerado pela IA a partir do título e do corpo. Aparece na lista; a pessoa não edita.
_Avoid_: descrição (campo de formulário), excerpt, abstract, resumo manual

**Sumário do workspace**:
Recorte curto do conjunto de Textos, gerado pela IA. Aparece na lista de textos; a pessoa não edita.
_Avoid_: descrição coletiva, overview, digest, resumo geral

**Chat**:
Conversa com a IA que monta contexto a partir de textos (anexados e/ou busca lexical) e pode gravar Textos (Escrita) quando a resposta cria ou altera um.
_Avoid_: Ação de IA, painel generate/improve, agente, tool

**Workspace**:
Recipiente dos textos (e, na B, do kanban). Na fatia A existe um único, criado no seed.
_Avoid_: Account, tenant (no código de produto), site

**Contexto (de IA)**:
Recorte de textos + pedido do usuário enviado ao provider. Na A: lexical / anexar; sem embeddings.
_Avoid_: RAG, knowledge graph, prompt (o prompt é o texto derivado enviado ao provedor)

**Provider**:
Porta que gera texto (stream ou síncrono). Runtime usa uma implementação real; testes e e2e usam um provider falso.
_Avoid_: SDK, Gemini (como nome da porta), modelo (como tipo de domínio)

**Stream**:
Resposta NDJSON de `POST /api/chats/:id/mensagens`. Linhas: `token`, `fonte`, `escrita`, `done` ou `error`.
_Avoid_: WebSocket, EventSource/SSE, reconstruir fontes a partir dos tokens

**Fonte**:
Texto citado na resposta do assistente (`textoId` + `titulo`), emitido como linha de stream e persistido na Mensagem.
_Avoid_: citation genérica, RAG hit, attachment

**Mensagem**:
Turno persistido de um Chat (`user` | `assistant`), com `conteudo` e, no assistente, `fontes` e `escritas`.
_Avoid_: prompt, completion, comment

**Escrita**:
Gravação de um Texto (criar ou alterar) feita pelo chat a partir da resposta da IA. Aparece na mensagem do assistente e como linha do stream.
_Avoid_: Apply, proposta de bloco, PageVersion, tool call

**Kanban**:
Quadro de colunas e cards (fatia B). Não faz parte da A.
_Avoid_: Board do Notion deste programa (isso é gestão do projeto, não o produto)

**Card**:
Item do kanban do produto (fatia B).
_Avoid_: Task do Notion, issue do GitHub (gestão)

**Vínculo**:
Ligação bidirecional entre um card e um texto (fatia B). Cardinalidade (1:1 vs N:N) fecha-se no feature-loop da B.
_Avoid_: Attach, mention, hyperlink solto sem persistência

