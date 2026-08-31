import { Module } from "@nestjs/common";
import { ChatsController } from "./chats.controller";
import { ChatsCoreModule } from "./chats-core.module";

@Module({
  imports: [ChatsCoreModule],
  controllers: [ChatsController],
})
export class ChatsModule {}
