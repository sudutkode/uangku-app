import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1775287678931 implements MigrationInterface {
  name = 'Init1775287678931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "icons" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "label" character varying NOT NULL, "tags" text, CONSTRAINT "UQ_fd1af68b0932014529d26096d33" UNIQUE ("name"), CONSTRAINT "PK_7d32565ab060c67427b635607de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd1af68b0932014529d26096d3" ON "icons" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53ea04e2c5a28f1a6f72428152" ON "icons" ("label") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53ea04e2c5a28f1a6f72428152"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd1af68b0932014529d26096d3"`,
    );
    await queryRunner.query(`DROP TABLE "icons"`);
  }
}
