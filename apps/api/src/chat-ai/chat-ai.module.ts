import { Module } from "@nestjs/common";
import { ChatsCoreModule } from "../chats/chats-core.module";
import { TextosModule } from "../textos/textos.module";
import { WorkspaceModule } from "../workspace/workspace.module";
import { AI_PROVIDER } from "../ai/ai-provider";
import { FakeAIProvider } from "../ai/fake-ai.provider";
import { GeminiProvider } from "../ai/gemini.provider";
import { ChatAiService } from "./chat-ai.service";
import { SumarioService } from "./sumario.service";

@Module({
  imports: [ChatsCoreModule, TextosModule, WorkspaceModule],
  providers: [
    {
      provide: AI_PROVIDER,
      useFactory: () => {
        if (process.env.AI_PROVIDER === "gemini") {
          return new GeminiProvider();
        }
        return new FakeAIProvider();
      },
    },
    ChatAiService,
    SumarioService,
  ],
  exports: [ChatAiService, SumarioService],
})
export class ChatAiModule {}
