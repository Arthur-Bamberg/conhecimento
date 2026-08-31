# ChatModule lazy no Nest

`AppModule` não importa `ChatModule`. O controller de chat é estático (`ChatHostModule`); no primeiro `POST .../mensagens`, `LazyModuleLoader` carrega serviço, `AIProvider` e o SDK Gemini. Critério da A: o módulo de chat/IA não está no grafo estático inicial. TypeORM da API permanece no bootstrap; só o grafo de IA/chat é lazy.
