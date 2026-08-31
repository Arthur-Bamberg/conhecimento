import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkspaceModule } from "../workspace/workspace.module";
import { Texto } from "./texto.entity";
import { TextosController } from "./textos.controller";
import { TextosService } from "./textos.service";

@Module({
  imports: [TypeOrmModule.forFeature([Texto]), WorkspaceModule],
  controllers: [TextosController],
  providers: [TextosService],
  exports: [TextosService],
})
export class TextosModule {}
