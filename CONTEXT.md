# Conhecimento

Textos organizados num workspace, usados principalmente por **chat com IA**. Kanban e vínculo com tarefas entram na fatia B. Segundo cérebro pessoal de Arthur Bamberg; o núcleo é o que a A Bamberg Desenvolvimento de Software pode oferecer depois.

## Language

**Texto**:
Unidade de conhecimento: título e corpo, no workspace. Na fatia A é a única peça persistida de produto além do chat.
_Avoid_: Página (recorte antigo), nota, documento, artigo, post

**Chat**:
Conversa com a IA que monta contexto a partir de textos (anexados e/ou busca lexical). É a interface da IA na fatia A.
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
Sequência de tokens da resposta do chat até o cliente. O contrato HTTP fecha-se no feature-loop da A.
_Avoid_: Websocket (salvo decisão explícita), EventSource como único transporte já escolhido

**Kanban**:
Quadro de colunas e cards (fatia B). Não faz parte da A.
_Avoid_: Board do Notion deste programa (isso é gestão do projeto, não o produto)

**Card**:
Item do kanban do produto (fatia B).
_Avoid_: Task do Notion, issue do GitHub (gestão)

**Vínculo**:
Ligação bidirecional entre um card e um texto (fatia B). Cardinalidade (1:1 vs N:N) fecha-se no feature-loop da B.
_Avoid_: Attach, mention, hyperlink solto sem persistência

**Apply**:
Não existe neste produto. A IA do chat responde; não propõe operações de bloco para o usuário gravar.
_Avoid_: Proposta, operação de bloco, PageVersion (recorte antigo)
