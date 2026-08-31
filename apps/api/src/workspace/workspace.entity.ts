import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Texto } from "../textos/texto.entity";
import { Chat } from "../chats/chat.entity";

@Entity({ name: "workspaces" })
export class Workspace {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  nome!: string;

  @Column({ type: "text", default: "" })
  sumario!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @OneToMany(() => Texto, (t) => t.workspace)
  textos!: Texto[];

  @OneToMany(() => Chat, (c) => c.workspace)
  chats!: Chat[];
}
