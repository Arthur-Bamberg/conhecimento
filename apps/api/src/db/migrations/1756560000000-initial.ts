import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1756560000000 implements MigrationInterface {
  name = "Initial1756560000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE workspaces (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nome text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE textos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id uuid NOT NULL REFERENCES workspaces(id),
        titulo text NOT NULL,
        corpo text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX textos_workspace_id_idx ON textos (workspace_id)`,
    );
    await queryRunner.query(`
      CREATE TABLE chats (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id uuid NOT NULL REFERENCES workspaces(id),
        titulo text NOT NULL DEFAULT 'Novo chat',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX chats_workspace_id_idx ON chats (workspace_id)`,
    );
    await queryRunner.query(`
      CREATE TABLE mensagens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        role text NOT NULL,
        conteudo text NOT NULL,
        fontes jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX mensagens_chat_id_idx ON mensagens (chat_id)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS mensagens`);
    await queryRunner.query(`DROP TABLE IF EXISTS chats`);
    await queryRunner.query(`DROP TABLE IF EXISTS textos`);
    await queryRunner.query(`DROP TABLE IF EXISTS workspaces`);
  }
}
