// ALTERADO: Importa a instância única do Prisma e o NextResponse
import prisma from '@/lib/prisma'; 
import { NextResponse } from 'next/server';

export const revalidate = 60; // NOVO: Cache. Revalida os dados a cada 60 segundos.

export async function GET(request) {
  try {
    // NOVO: Lógica de Paginação
    // Pega os parâmetros 'page' e 'limit' da URL (ex: /api/pegar_foco?page=1&limit=10)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Busca os registros e o total de registros de forma otimizada
    const [registros, total] = await prisma.$transaction([
      prisma.registro.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.registro.count(), // Pega a contagem total de registros
    ]);

    // Calcula o total de páginas
    const totalPages = Math.ceil(total / limit);

    // ALTERADO: Usa NextResponse.json para uma resposta mais limpa
    return NextResponse.json({
      data: registros,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    });

  } catch (error) {
    console.error("Erro ao buscar registros:", error);
    // ALTERADO: Usa NextResponse.json para a resposta de erro
    return NextResponse.json(
      { error: 'Não foi possível buscar os registros.' },
      { status: 500 }
    );
  }
}