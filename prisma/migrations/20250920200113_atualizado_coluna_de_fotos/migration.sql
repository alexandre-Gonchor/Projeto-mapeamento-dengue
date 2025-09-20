/*
  Warnings:

  - You are about to drop the column `foto` on the `Registro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Registro" DROP COLUMN "foto",
ADD COLUMN     "fotoUrl" TEXT;
