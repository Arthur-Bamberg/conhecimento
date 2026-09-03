# Chat — overrides

Workspace de conversa: lista de chats + thread + composer.

- Desktop: sidebar de conversas; mobile: faixa horizontal (sem `max-h-48` que esconde conversas).
- Composer com label visível «Mensagem»; Enter envia, Shift+Enter quebra linha.
- Mensagens da pessoa à direita, bolha `accent-soft` + texto `accent-hover`; resposta da IA à esquerda.
- Fontes citadas e textos gravados (Escrita) são links para `/textos/:id`, não só cor.
- Erro de IA: `role="alert"` + copiar relatório (já existente).
- Composer colado ao fundo da coluna (`sticky` + coluna com altura limitada): sempre visível para perguntar; as mensagens é que fazem scroll.
