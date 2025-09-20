// app/api/pegar_foco/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Busca todos os registros na tabela usando o Prisma
    const registros = await prisma.registro.findMany({
      // Ordena pelos mais recentes primeiro
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Retorna os registros encontrados com status 200 (OK)
    return new Response(
      JSON.stringify(registros),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Em caso de erro, loga e retorna uma mensagem de erro
    console.error("Erro ao buscar registros:", error);
    return new Response(
      JSON.stringify({ error: 'Não foi possível buscar os registros.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}