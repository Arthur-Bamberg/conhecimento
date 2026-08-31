# Stream de chat via POST + NDJSON

`POST /api/chats/:id/mensagens` envia `conteudo` e `textoIds` no body e responde NDJSON (`token`, `fonte`, `done` | `error`). EventSource/SSE clássico é GET e não carrega o pedido; WebSocket seria outra superfície. O cliente nunca reconstrói fontes a partir dos tokens — a linha `fonte` vem do backend.
