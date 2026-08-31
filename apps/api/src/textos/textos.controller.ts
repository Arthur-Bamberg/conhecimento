import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { LazyModuleLoader } from "@nestjs/core";
import { createTextoSchema, patchTextoSchema } from "@conhecimento/contracts";
import { parseBody } from "../http/parse-body";
import { recorteColecao, recorteSumario } from "../ai/recorte-sumario";
import { serializeTexto } from "./serialize-texto";
import { TextosService } from "./textos.service";
import { WorkspaceService } from "../workspace/workspace.service";
import type { Texto } from "./texto.entity";

@Controller("textos")
export class TextosController {
  constructor(
    @Inject(TextosService) private readonly textos: TextosService,
    @Inject(WorkspaceService) private readonly workspaces: WorkspaceService,
    @Inject(LazyModuleLoader) private readonly lazyModuleLoader: LazyModuleLoader,
  ) {}

  @Get()
  async list() {
    const rows = await this.textos.list();
    return rows.map(serializeTexto);
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = parseBody(createTextoSchema, body);
    const texto = await this.textos.create(input);
    const comSumario = await this.aplicarSumario(texto);
    await this.aplicarSumarioColecao();
    return serializeTexto(comSumario);
  }

  @Get(":id")
  async get(@Param("id", ParseUUIDPipe) id: string) {
    return serializeTexto(await this.textos.get(id));
  }

  @Patch(":id")
  async patch(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const input = parseBody(patchTextoSchema, body);
    const texto = await this.textos.patch(id, input);
    if (input.titulo !== undefined || input.corpo !== undefined) {
      const comSumario = await this.aplicarSumario(texto);
      await this.aplicarSumarioColecao();
      return serializeTexto(comSumario);
    }
    return serializeTexto(texto);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.textos.remove(id);
    await this.aplicarSumarioColecao();
  }

  private async aplicarSumario(texto: Texto): Promise<Texto> {
    try {
      const { ChatAiModule } = await import("../chat-ai/chat-ai.module");
      const { SumarioService } = await import("../chat-ai/sumario.service");
      const moduleRef = await this.lazyModuleLoader.load(() => ChatAiModule);
      const sumario = await moduleRef.get(SumarioService).gerar(
        texto.titulo,
        texto.corpo,
      );
      return this.textos.atualizarSumario(texto.id, sumario);
    } catch {
      return this.textos.atualizarSumario(
        texto.id,
        recorteSumario(texto.titulo, texto.corpo),
      );
    }
  }

  private async aplicarSumarioColecao(): Promise<void> {
    const textos = await this.textos.list();
    try {
      const { ChatAiModule } = await import("../chat-ai/chat-ai.module");
      const { SumarioService } = await import("../chat-ai/sumario.service");
      const moduleRef = await this.lazyModuleLoader.load(() => ChatAiModule);
      const sumario = await moduleRef.get(SumarioService).gerarColecao(textos);
      await this.workspaces.atualizarSumario(sumario);
    } catch {
      await this.workspaces.atualizarSumario(recorteColecao(textos));
    }
  }
}
