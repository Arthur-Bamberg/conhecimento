import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkspaceModule } from "../workspace/workspace.module";
import { Chat } from "./chat.entity";
import { ChatsService } from "./chats.service";
import { Mensagem } from "./mensagem.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Mensagem]), WorkspaceModule],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsCoreModule {}
