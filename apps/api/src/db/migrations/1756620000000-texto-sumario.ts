import { MigrationInterface, QueryRunner } from "typeorm";

export class TextoSumario1756620000000 implements MigrationInterface {
  name = "TextoSumario1756620000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE textos ADD COLUMN IF NOT EXISTS sumario text NOT NULL DEFAULT ''`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE textos DROP COLUMN IF EXISTS sumario`);
  }
}
