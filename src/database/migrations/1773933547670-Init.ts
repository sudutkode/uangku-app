import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1773933547670 implements MigrationInterface {
  name = 'Init1773933547670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_transactions_externalRef"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" ADD "note" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "note"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_transactions_externalRef" ON "transactions" ("externalRef") WHERE ("externalRef" IS NOT NULL)`,
    );
  }
}
