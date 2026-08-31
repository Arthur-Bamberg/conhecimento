import { MigrationInterface, QueryRunner } from "typeorm";

export class WorkspaceSumario1756680000000 implements MigrationInterface {
  name = "WorkspaceSumario1756680000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS sumario text NOT NULL DEFAULT ''`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE workspaces DROP COLUMN IF EXISTS sumario`,
    );
  }
}
