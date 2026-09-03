import { Inject, Injectable } from "@nestjs/common";
import type { CreateMensagem, Escrita, StreamLine } from "@conhecimento/contracts";
import { TextosService } from "../textos/textos.service";
import { ChatsService } from "../chats/chats.service";
import { WorkspaceService } from "../workspace/workspace.service";
import { AI_PROVIDER, type AIProvider } from "../ai/ai-provider";
import { montarContexto } from "../ai/context-builder";
import {
  extrairEscritas,
  type EscritaProposta,
} from "../ai/extrair-escritas";
import { SumarioService } from "./sumario.service";
import type { Texto } from "../textos/texto.entity";

@Injectable()
export class ChatAiService {
  constructor(
    @Inject(ChatsService) private readonly chats: ChatsService,
    @Inject(TextosService) private readonly textos: TextosService,
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    @Inject(SumarioService) private readonly sumarios: SumarioService,
    @Inject(WorkspaceService) private readonly workspaces: WorkspaceService,
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
    const propostas: EscritaProposta[] = [];
    let falhou = false;
    for await (const line of this.provider.stream({
      pedido: input.conteudo,
      textos: contexto.textos,
      historico,
    })) {
      if (line.type === "escrita_proposta") {
        propostas.push(line);
        continue;
      }
      if (line.type === "token") {
        conteudo += line.text;
      }
      if (line.type === "fonte") {
        fontes.push({ textoId: line.textoId, titulo: line.titulo });
      }
      if (line.type === "error") {
        falhou = true;
        yield line;
        break;
      }
      if (line.type === "done") {
        break;
      }
      yield line;
    }
    const extraido = extrairEscritas(conteudo);
    conteudo = extraido.visivel;
    for (const proposta of extraido.propostas) {
      if (
        !propostas.some(
          (p) =>
            p.acao === proposta.acao &&
            p.titulo === proposta.titulo &&
            p.corpo === proposta.corpo,
        )
      ) {
        propostas.push(proposta);
      }
    }
    const escritas: Escrita[] = [];
    if (!falhou) {
      for (const proposta of propostas) {
        const aplicada = await this.aplicarProposta(proposta);
        if (aplicada) {
          escritas.push(aplicada);
          yield { type: "escrita", ...aplicada };
        }
      }
      yield { type: "done" };
    }
    if (conteudo.length > 0 || escritas.length > 0) {
      await this.chats.saveAssistantMessage(
        chatId,
        conteudo,
        fontes,
        escritas,
      );
    }
  }

  private async aplicarProposta(
    proposta: EscritaProposta,
  ): Promise<Escrita | undefined> {
    if (proposta.acao === "criar") {
      const texto = await this.textos.create({
        titulo: proposta.titulo,
        corpo: proposta.corpo,
      });
      await this.persistirSumarios(texto);
      return { acao: "criar", textoId: texto.id, titulo: texto.titulo };
    }
    const alvo = await this.resolverAlteracao(proposta);
    if (!alvo) {
      return undefined;
    }
    const texto = await this.textos.patch(alvo.id, {
      titulo: proposta.titulo,
      corpo: proposta.corpo,
    });
    await this.persistirSumarios(texto);
    return { acao: "alterar", textoId: texto.id, titulo: texto.titulo };
  }

  private async resolverAlteracao(proposta: EscritaProposta) {
    if (proposta.textoId) {
      try {
        return await this.textos.get(proposta.textoId);
      } catch {
        // cai no título
      }
    }
    const lista = await this.textos.list();
    return lista.find(
      (t) => t.titulo.toLowerCase() === proposta.titulo.toLowerCase(),
    );
  }

  private async persistirSumarios(texto: Texto): Promise<void> {
    const sumario = await this.sumarios.gerar(texto.titulo, texto.corpo);
    await this.textos.atualizarSumario(texto.id, sumario);
    const todos = await this.textos.list();
    const colecao = await this.sumarios.gerarColecao(todos);
    await this.workspaces.atualizarSumario(colecao);
  }
}
