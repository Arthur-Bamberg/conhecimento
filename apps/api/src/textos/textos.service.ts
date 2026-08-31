import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { CreateTexto, PatchTexto } from "@conhecimento/contracts";
import { Texto } from "./texto.entity";
import { WorkspaceService } from "../workspace/workspace.service";

@Injectable()
export class TextosService {
  constructor(
    @InjectRepository(Texto)
    private readonly textos: Repository<Texto>,
    @Inject(WorkspaceService)
    private readonly workspaces: WorkspaceService,
  ) {}

  async list(): Promise<Texto[]> {
    const workspace = await this.workspaces.ensurePessoal();
    return this.textos.find({
      where: { workspaceId: workspace.id },
      order: { updatedAt: "DESC" },
    });
  }

  async create(input: CreateTexto): Promise<Texto> {
    const workspace = await this.workspaces.ensurePessoal();
    return this.textos.save(
      this.textos.create({
        workspaceId: workspace.id,
        titulo: input.titulo,
        corpo: input.corpo ?? "",
      }),
    );
  }

  async get(id: string): Promise<Texto> {
    const workspace = await this.workspaces.ensurePessoal();
    const texto = await this.textos.findOne({
      where: { id, workspaceId: workspace.id },
    });
    if (!texto) {
      throw new HttpException(
        { error: { code: "TEXTO_NOT_FOUND", message: "Texto não encontrado." } },
        HttpStatus.NOT_FOUND,
      );
    }
    return texto;
  }

  async patch(id: string, input: PatchTexto): Promise<Texto> {
    const texto = await this.get(id);
    if (input.titulo !== undefined) {
      texto.titulo = input.titulo;
    }
    if (input.corpo !== undefined) {
      texto.corpo = input.corpo;
    }
    return this.textos.save(texto);
  }

  async atualizarSumario(id: string, sumario: string): Promise<Texto> {
    const texto = await this.get(id);
    texto.sumario = sumario;
    return this.textos.save(texto);
  }

  async remove(id: string): Promise<void> {
    const texto = await this.get(id);
    await this.textos.remove(texto);
  }
}
