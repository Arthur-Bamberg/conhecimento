import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "./chats/chat.entity";
import { ChatsModule } from "./chats/chats.module";
import { Mensagem } from "./chats/mensagem.entity";
import { Initial1756560000000 } from "./db/migrations/1756560000000-initial";
import { TextoSumario1756620000000 } from "./db/migrations/1756620000000-texto-sumario";
import { WorkspaceSumario1756680000000 } from "./db/migrations/1756680000000-workspace-sumario";
import { MensagemEscritas1756800000000 } from "./db/migrations/1756800000000-mensagem-escritas";
import { HealthController } from "./health.controller";
import { Texto } from "./textos/texto.entity";
import { TextosModule } from "./textos/textos.module";
import { Workspace } from "./workspace/workspace.entity";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url:
        process.env.DATABASE_URL ??
        "postgres://conhecimento:conhecimento@localhost:5433/conhecimento",
      entities: [Workspace, Texto, Chat, Mensagem],
      migrations: [
        Initial1756560000000,
        TextoSumario1756620000000,
        WorkspaceSumario1756680000000,
        MensagemEscritas1756800000000,
      ],
      retryAttempts: process.env.VITEST ? 0 : 10,
      synchronize: Boolean(process.env.VITEST),
      migrationsRun: !process.env.VITEST,
    }),
    WorkspaceModule,
    TextosModule,
    ChatsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
