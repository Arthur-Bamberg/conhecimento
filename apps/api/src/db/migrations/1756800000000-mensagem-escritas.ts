import { MigrationInterface, QueryRunner } from "typeorm";

export class MensagemEscritas1756800000000 implements MigrationInterface {
  name = "MensagemEscritas1756800000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS escritas jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE mensagens DROP COLUMN IF EXISTS escritas`,
    );
  }
}
