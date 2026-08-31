import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Workspace } from "./workspace.entity";

@Injectable()
export class WorkspaceService implements OnModuleInit {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaces: Repository<Workspace>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensurePessoal();
  }

  async ensurePessoal(): Promise<Workspace> {
    const existing = await this.workspaces.find({ take: 1, order: { createdAt: "ASC" } });
    if (existing[0]) {
      return existing[0];
    }
    return this.workspaces.save(this.workspaces.create({ nome: "Pessoal" }));
  }

  async atualizarSumario(sumario: string): Promise<Workspace> {
    const workspace = await this.ensurePessoal();
    workspace.sumario = sumario;
    return this.workspaces.save(workspace);
  }
}
