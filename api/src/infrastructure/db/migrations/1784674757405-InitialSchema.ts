import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1784674757405 implements MigrationInterface {
  public name = 'InitialSchema1784674757405';

  public up = async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "catalog"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "client"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "pledge"');

    await queryRunner.query(`
      CREATE TYPE "pledge"."pledge_status_enum" AS ENUM ('ACTIVE', 'REDEEMED')
    `);

    await queryRunner.query(`
      CREATE TYPE "catalog"."characteristic_field_type_enum" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN')
    `);

    await queryRunner.query(`
      CREATE TABLE "catalog"."tariff" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "name" CHARACTER VARYING NOT NULL,
        "base_period_days" SMALLINT NOT NULL,
        "base_period_rate" NUMERIC(10,4) NOT NULL,
        "overdue_period_days" SMALLINT NOT NULL,
        "overdue_rate" NUMERIC(10,4) NOT NULL,
        CONSTRAINT "PK_catalog_tariff" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "catalog"."item_category" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "name" CHARACTER VARYING NOT NULL,
        CONSTRAINT "PK_catalog_item_category" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "catalog"."item_category_characteristic_field" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "category_id" BIGINT NOT NULL,
        "key" CHARACTER VARYING NOT NULL,
        "label" CHARACTER VARYING NOT NULL,
        "type" "catalog"."characteristic_field_type_enum" NOT NULL,
        "required" BOOLEAN NOT NULL DEFAULT FALSE,
        "sort_order" SMALLINT NOT NULL DEFAULT 0,
        CONSTRAINT "PK_catalog_item_category_characteristic_field" PRIMARY KEY ("id"),
        CONSTRAINT "FK_item_category_characteristic_field_category" FOREIGN KEY ("category_id")
          REFERENCES "catalog"."item_category"("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_item_category_characteristic_field_category_key"
        ON "catalog"."item_category_characteristic_field" ("category_id", "key")
        WHERE "deleted" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "item_category_characteristic_field__category_id_idx"
        ON "catalog"."item_category_characteristic_field" ("category_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "client"."client" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "last_name" CHARACTER VARYING NOT NULL,
        "first_name" CHARACTER VARYING NOT NULL,
        "middle_name" CHARACTER VARYING,
        "phone" CHARACTER VARYING NOT NULL,
        CONSTRAINT "PK_client_client" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "pledge"."pledge" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "tariff_id" BIGINT NOT NULL,
        "client_id" BIGINT NOT NULL,
        "created_date" TIMESTAMPTZ NOT NULL,
        "due_date" TIMESTAMPTZ NOT NULL,
        "loan_amount" NUMERIC(14,2) NOT NULL,
        "status" "pledge"."pledge_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "redeemed_at" TIMESTAMPTZ,
        "redemption_amount" NUMERIC(14,2),
        CONSTRAINT "PK_pledge_pledge" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pledge_tariff" FOREIGN KEY ("tariff_id")
          REFERENCES "catalog"."tariff"("id"),
        CONSTRAINT "FK_pledge_client" FOREIGN KEY ("client_id")
          REFERENCES "client"."client"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "pledge__tariff_id_idx" ON "pledge"."pledge" ("tariff_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "pledge__client_id_idx" ON "pledge"."pledge" ("client_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "pledge"."pledge_item" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "pledge_id" BIGINT NOT NULL,
        "category_id" BIGINT NOT NULL,
        "name" CHARACTER VARYING NOT NULL,
        "appraisal_amount" NUMERIC(14,2) NOT NULL,
        CONSTRAINT "PK_pledge_pledge_item" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pledge_item_pledge" FOREIGN KEY ("pledge_id")
          REFERENCES "pledge"."pledge"("id"),
        CONSTRAINT "FK_pledge_item_category" FOREIGN KEY ("category_id")
          REFERENCES "catalog"."item_category"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "pledge_item__pledge_id_idx" ON "pledge"."pledge_item" ("pledge_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "pledge_item__category_id_idx" ON "pledge"."pledge_item" ("category_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "pledge"."pledge_item_characteristic_value" (
        "id" BIGSERIAL NOT NULL,
        "created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted" TIMESTAMPTZ,
        "pledge_item_id" BIGINT NOT NULL,
        "field_id" BIGINT NOT NULL,
        "value" CHARACTER VARYING NOT NULL,
        CONSTRAINT "PK_pledge_item_characteristic_value" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pledge_item_characteristic_value_item" FOREIGN KEY ("pledge_item_id")
          REFERENCES "pledge"."pledge_item"("id"),
        CONSTRAINT "FK_pledge_item_characteristic_value_field" FOREIGN KEY ("field_id")
          REFERENCES "catalog"."item_category_characteristic_field"("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_pledge_item_characteristic_value_item_field"
        ON "pledge"."pledge_item_characteristic_value" ("pledge_item_id", "field_id")
        WHERE "deleted" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "pledge_item_characteristic_value__pledge_item_id_idx"
        ON "pledge"."pledge_item_characteristic_value" ("pledge_item_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "pledge_item_characteristic_value__field_id_idx"
        ON "pledge"."pledge_item_characteristic_value" ("field_id")
    `);
  };

  public down = async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query('DROP TABLE IF EXISTS "pledge"."pledge_item_characteristic_value"');
    await queryRunner.query('DROP TABLE IF EXISTS "pledge"."pledge_item"');
    await queryRunner.query('DROP TABLE IF EXISTS "pledge"."pledge"');
    await queryRunner.query('DROP TYPE IF EXISTS "pledge"."pledge_status_enum"');
    await queryRunner.query('DROP TABLE IF EXISTS "client"."client"');
    await queryRunner.query('DROP TABLE IF EXISTS "catalog"."item_category_characteristic_field"');
    await queryRunner.query('DROP TYPE IF EXISTS "catalog"."characteristic_field_type_enum"');
    await queryRunner.query('DROP TABLE IF EXISTS "catalog"."item_category"');
    await queryRunner.query('DROP TABLE IF EXISTS "catalog"."tariff"');
    await queryRunner.query('DROP SCHEMA IF EXISTS "pledge"');
    await queryRunner.query('DROP SCHEMA IF EXISTS "client"');
    await queryRunner.query('DROP SCHEMA IF EXISTS "catalog"');
  };
}
