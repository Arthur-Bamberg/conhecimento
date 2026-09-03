# Chat grava Texto via Escrita no stream

O chat aplica criar/alterar de Texto no servidor a partir da resposta da IA (linha NDJSON `escrita`, persistida em `Mensagem.escritas`). Não é o Apply de blocos do recorte antigo: a pessoa não confirma operação por operação; o Fake emite a proposta por padrão de pedido e o Gemini por bloco `:::escrita`, sem segunda chamada JSON.
