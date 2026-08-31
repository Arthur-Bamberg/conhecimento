import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkspaceService } from "../workspace/workspace.service";
import { Chat } from "./chat.entity";
import { Mensagem } from "./mensagem.entity";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chats: Repository<Chat>,
    @InjectRepository(Mensagem)
    private readonly mensagens: Repository<Mensagem>,
    @Inject(WorkspaceService)
    private readonly workspaces: WorkspaceService,
  ) {}

  async list(): Promise<Chat[]> {
    const workspace = await this.workspaces.ensurePessoal();
    return this.chats.find({
      where: { workspaceId: workspace.id },
      order: { updatedAt: "DESC" },
    });
  }

  async create(titulo?: string): Promise<Chat> {
    const workspace = await this.workspaces.ensurePessoal();
    return this.chats.save(
      this.chats.create({
        workspaceId: workspace.id,
        titulo: titulo?.trim() || "Novo chat",
      }),
    );
  }

  async get(id: string): Promise<Chat> {
    const workspace = await this.workspaces.ensurePessoal();
    const chat = await this.chats.findOne({
      where: { id, workspaceId: workspace.id },
      relations: { mensagens: true },
    });
    if (!chat) {
      throw new HttpException(
        { error: { code: "CHAT_NOT_FOUND", message: "Chat não encontrado." } },
        HttpStatus.NOT_FOUND,
      );
    }
    chat.mensagens.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    return chat;
  }

  async saveUserMessage(chatId: string, conteudo: string): Promise<Mensagem> {
    await this.get(chatId);
    const msg = await this.mensagens.save(
      this.mensagens.create({
        chatId,
        role: "user",
        conteudo,
        fontes: [],
      }),
    );
    await this.chats.update(chatId, { updatedAt: new Date() });
    return msg;
  }

  async saveAssistantMessage(
    chatId: string,
    conteudo: string,
    fontes: Mensagem["fontes"],
  ): Promise<Mensagem> {
    const msg = await this.mensagens.save(
      this.mensagens.create({
        chatId,
        role: "assistant",
        conteudo,
        fontes,
      }),
    );
    const firstLine = conteudo.split("\n")[0]?.slice(0, 80);
    if (firstLine) {
      await this.chats.update(chatId, {
        titulo: firstLine,
        updatedAt: new Date(),
      });
    }
    return msg;
  }
}
