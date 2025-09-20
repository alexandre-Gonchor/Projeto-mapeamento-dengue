/*
  Warnings:

  - The `status` column on the `Registro` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('suspeito', 'confirmado', 'resolvido');

-- AlterTable
ALTER TABLE "public"."Registro" DROP COLUMN "status",
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'suspeito';
