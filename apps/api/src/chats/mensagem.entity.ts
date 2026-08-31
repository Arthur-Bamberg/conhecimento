import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Fonte } from "@conhecimento/contracts";
import { Chat } from "./chat.entity";

@Entity({ name: "mensagens" })
export class Mensagem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "chat_id", type: "uuid" })
  chatId!: string;

  @ManyToOne(() => Chat, (c) => c.mensagens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chat_id" })
  chat!: Chat;

  @Column({ type: "text" })
  role!: "user" | "assistant";

  @Column({ type: "text" })
  conteudo!: string;

  @Column({ type: "jsonb", default: [] })
  fontes!: Fonte[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
