# Stream de chat via POST + NDJSON

`POST /api/chats/:id/mensagens` envia `conteudo` e `textoIds` no body e responde NDJSON (`token`, `fonte`, `escrita`, `done` | `error`). EventSource/SSE clássico é GET e não carrega o pedido; WebSocket seria outra superfície. O cliente nunca reconstrói fontes nem escritas a partir dos tokens — essas linhas vêm do backend depois de gravar.
