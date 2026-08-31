import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from "@nestjs/common";
import { LazyModuleLoader } from "@nestjs/core";
import { createChatSchema, createMensagemSchema } from "@conhecimento/contracts";
import type { Response } from "express";
import { parseBody } from "../http/parse-body";
import { ChatsService } from "./chats.service";
import { serializeChat, serializeChatDetalhe } from "./serialize-chat";

@Controller("chats")
export class ChatsController {
  constructor(
    @Inject(ChatsService) private readonly chats: ChatsService,
    @Inject(LazyModuleLoader) private readonly lazyModuleLoader: LazyModuleLoader,
  ) {}

  @Get()
  async list() {
    return (await this.chats.list()).map(serializeChat);
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = parseBody(createChatSchema, body ?? {});
    return serializeChat(await this.chats.create(input.titulo));
  }

  @Get(":id")
  async get(@Param("id", ParseUUIDPipe) id: string) {
    return serializeChatDetalhe(await this.chats.get(id));
  }

  @Post(":id/mensagens")
  async mensagens(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @Res() res: Response,
  ): Promise<void> {
    const input = parseBody(createMensagemSchema, body);
    const { ChatAiModule } = await import("../chat-ai/chat-ai.module");
    const { ChatAiService } = await import("../chat-ai/chat-ai.service");
    const moduleRef = await this.lazyModuleLoader.load(() => ChatAiModule);
    const ai = moduleRef.get(ChatAiService);
    res.status(200);
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    try {
      for await (const line of ai.responder(id, input)) {
        res.write(`${JSON.stringify(line)}\n`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro no chat.";
      res.write(
        `${JSON.stringify({ type: "error", code: "CHAT_FAILED", message })}\n`,
      );
    }
    res.end();
  }
}
