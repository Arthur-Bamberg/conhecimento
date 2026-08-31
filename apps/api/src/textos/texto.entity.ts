import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Workspace } from "../workspace/workspace.entity";

@Entity({ name: "textos" })
export class Texto {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "workspace_id", type: "uuid" })
  workspaceId!: string;

  @ManyToOne(() => Workspace, (w) => w.textos)
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column({ type: "text" })
  titulo!: string;

  @Column({ type: "text", default: "" })
  corpo!: string;

  @Column({ type: "text", default: "" })
  sumario!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
