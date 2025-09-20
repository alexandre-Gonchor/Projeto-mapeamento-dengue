import prisma from '@/lib/prisma'; 
import { NextResponse } from 'next/server';

// NOVO: Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

// A linha 'revalidate' também torna a rota dinâmica, mas 'force-dynamic' é mais explícito para este caso.
// export const revalidate = 60; 

export async function GET(request) {
  try {
    // Esta linha é a causa do erro, pois só pode ser executada no momento da requisição
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // ... (resto do seu código) ...

    const [registros, total] = await prisma.$transaction([
      prisma.registro.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.registro.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

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
    return NextResponse.json(
      { error: 'Não foi possível buscar os registros.' },
      { status: 500 }
    );
  }
}