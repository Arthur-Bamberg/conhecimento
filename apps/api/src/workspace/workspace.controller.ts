import { Controller, Get, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Texto } from "../textos/texto.entity";
import { serializeWorkspace } from "./serialize-workspace";
import { WorkspaceService } from "./workspace.service";

@Controller("workspace")
export class WorkspaceController {
  constructor(
    @Inject(WorkspaceService) private readonly workspaces: WorkspaceService,
    @InjectRepository(Texto) private readonly textos: Repository<Texto>,
  ) {}

  @Get()
  async get() {
    const workspace = await this.workspaces.ensurePessoal();
    const textos = await this.textos.find({
      where: { workspaceId: workspace.id },
      order: { updatedAt: "DESC" },
    });
    return serializeWorkspace(workspace, textos);
  }
}
