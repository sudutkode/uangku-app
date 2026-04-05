import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1774696476715 implements MigrationInterface {
  name = 'Init1774696476715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_2a49fe7879bf8a02812639cea61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "iconName" character varying, "transactionTypeId" integer, "userId" integer, CONSTRAINT "PK_bbd38b9174546b0ed4fe04689c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "amount" numeric(18,2) NOT NULL DEFAULT '0', "adminFee" numeric(18,2) NOT NULL DEFAULT '0', "externalRef" character varying(100), "note" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transactionTypeId" integer, "transactionCategoryId" integer, "userId" integer, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_wallets" ("id" SERIAL NOT NULL, "isIncoming" boolean NOT NULL, "amount" numeric(18,2) NOT NULL DEFAULT '0', "transactionId" integer, "walletId" integer, CONSTRAINT "PK_cefc65e9f4de1aa5d151145304f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loans" ("id" SERIAL NOT NULL, "isGiven" boolean NOT NULL DEFAULT false, "isPaid" boolean NOT NULL DEFAULT false, "amount" numeric(18,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "givenDate" TIMESTAMP WITH TIME ZONE NOT NULL, "paidDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5c6942c1e13e4de135c5203ee61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loan_wallets" ("id" SERIAL NOT NULL, "isIncoming" boolean NOT NULL, "amount" numeric(18,2) NOT NULL DEFAULT '0', "loanId" integer, "walletId" integer, CONSTRAINT "PK_35a7fc127f73127a406a377d903" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "balance" numeric(18,2) NOT NULL DEFAULT '0', "appName" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "identifierHash" character varying NOT NULL, "username" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_959a2d0c37ee53ee4663c24434d" UNIQUE ("identifierHash"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_categories" ADD CONSTRAINT "FK_1fa925fe6cebf56686bd9a8a8e2" FOREIGN KEY ("transactionTypeId") REFERENCES "transaction_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_categories" ADD CONSTRAINT "FK_3f836aec025ac9aad63d0abc176" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_13ec2f6f02ddbb52a02ab867156" FOREIGN KEY ("transactionTypeId") REFERENCES "transaction_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_499c46affcbe1d36f7281d90db8" FOREIGN KEY ("transactionCategoryId") REFERENCES "transaction_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_wallets" ADD CONSTRAINT "FK_173c62a5d621a307ded3e22fb73" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_wallets" ADD CONSTRAINT "FK_3bc0fded9e1a1ff3be71b4b4dbe" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_wallets" ADD CONSTRAINT "FK_12c9de40647828ee095734d298d" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_wallets" ADD CONSTRAINT "FK_9fcab905c6633c7280f0b079b7d" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_wallets" DROP CONSTRAINT "FK_9fcab905c6633c7280f0b079b7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_wallets" DROP CONSTRAINT "FK_12c9de40647828ee095734d298d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_wallets" DROP CONSTRAINT "FK_3bc0fded9e1a1ff3be71b4b4dbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_wallets" DROP CONSTRAINT "FK_173c62a5d621a307ded3e22fb73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_499c46affcbe1d36f7281d90db8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_13ec2f6f02ddbb52a02ab867156"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_categories" DROP CONSTRAINT "FK_3f836aec025ac9aad63d0abc176"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_categories" DROP CONSTRAINT "FK_1fa925fe6cebf56686bd9a8a8e2"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TABLE "loan_wallets"`);
    await queryRunner.query(`DROP TABLE "loans"`);
    await queryRunner.query(`DROP TABLE "transaction_wallets"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "transaction_categories"`);
    await queryRunner.query(`DROP TABLE "transaction_types"`);
  }
}
