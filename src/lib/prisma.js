import { PrismaClient } from '@prisma/client';

// Esta abordagem evita criar múltiplas instâncias do PrismaClient em desenvolvimento
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;