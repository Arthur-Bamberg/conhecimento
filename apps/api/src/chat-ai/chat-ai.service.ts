import { Inject, Injectable } from "@nestjs/common";
import type { CreateMensagem, StreamLine } from "@conhecimento/contracts";
import { TextosService } from "../textos/textos.service";
import { ChatsService } from "../chats/chats.service";
import { AI_PROVIDER, type AIProvider } from "../ai/ai-provider";
import { montarContexto } from "../ai/context-builder";

@Injectable()
export class ChatAiService {
  constructor(
    @Inject(ChatsService) private readonly chats: ChatsService,
    @Inject(TextosService) private readonly textos: TextosService,
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
  ) {}

  async *responder(
    chatId: string,
    input: CreateMensagem,
  ): AsyncIterable<StreamLine> {
    await this.chats.saveUserMessage(chatId, input.conteudo);
    const textos = await this.textos.list();
    const contexto = montarContexto({
      pedido: input.conteudo,
      textos: textos.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        corpo: t.corpo,
      })),
      textoIds: input.textoIds,
    });
    const chat = await this.chats.get(chatId);
    const historico = (chat.mensagens ?? [])
      .slice(0, -1)
      .slice(-8)
      .map((m) => ({ role: m.role, conteudo: m.conteudo }));
    let conteudo = "";
    const fontes: { textoId: string; titulo: string }[] = [];
    for await (const line of this.provider.stream({
      pedido: input.conteudo,
      textos: contexto.textos,
      historico,
    })) {
      if (line.type === "token") {
        conteudo += line.text;
      }
      if (line.type === "fonte") {
        fontes.push({ textoId: line.textoId, titulo: line.titulo });
      }
      yield line;
      if (line.type === "done" || line.type === "error") {
        break;
      }
    }
    if (conteudo.length > 0) {
      await this.chats.saveAssistantMessage(chatId, conteudo, fontes);
    }
  }
}
