import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Texto } from "../textos/texto.entity";
import { Workspace } from "./workspace.entity";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceService } from "./workspace.service";

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, Texto])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService, TypeOrmModule],
})
export class WorkspaceModule {}
