import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLostFoundPets1746568800000 implements MigrationInterface {
  name = 'CreateLostFoundPets1746568800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lost_pets" (
        "id" SERIAL NOT NULL,
        "pet_name" character varying NOT NULL,
        "species" character varying NOT NULL,
        "description" character varying NOT NULL,
        "contact_phone" character varying NOT NULL,
        "location" geometry(Point,4326) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lost_pets" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "found_pets" (
        "id" SERIAL NOT NULL,
        "description" character varying NOT NULL,
        "contact_phone" character varying NOT NULL,
        "location" geometry(Point,4326) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_found_pets" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "found_pets"`);
    await queryRunner.query(`DROP TABLE "lost_pets"`);
  }
}
