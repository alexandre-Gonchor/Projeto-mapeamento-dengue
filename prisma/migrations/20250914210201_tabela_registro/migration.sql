/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Registro" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);
