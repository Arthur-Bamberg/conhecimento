import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Workspace } from "../workspace/workspace.entity";
import { Mensagem } from "./mensagem.entity";

@Entity({ name: "chats" })
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "workspace_id", type: "uuid" })
  workspaceId!: string;

  @ManyToOne(() => Workspace, (w) => w.chats)
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column({ type: "text", default: "Novo chat" })
  titulo!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Mensagem, (m) => m.chat)
  mensagens!: Mensagem[];
}
