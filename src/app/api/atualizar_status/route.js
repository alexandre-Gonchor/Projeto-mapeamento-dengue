// ALTERADO: Importa a instância única do Prisma e helpers do Next.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // 1. Validação dos dados recebidos (já estava ótima)
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID do registro e novo status são obrigatórios.' },
        { status: 400 }
      );
    }
    
    const statusPermitidos = ['suspeito', 'confirmado', 'resolvido'];
    if (!statusPermitidos.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido.' },
        { status: 400 }
      );
    }

    // 2. Tenta atualizar o registro no banco de dados
    const registroAtualizado = await prisma.registro.update({
      where: {
        // O Prisma lida com a conversão de tipo, mas garantir que seja um número é seguro.
        id: Number(id), 
      },
      data: {
        status: status,
      },
    });
    
    // 3. NOVO: Invalida o cache da página principal
    // Isso garante que, na próxima visita à página, os dados da lista de registros serão buscados novamente.
    revalidatePath('/'); // Invalida o cache da rota da página inicial
    revalidatePath('/api/pegar_foco'); // Também pode invalidar a rota da API diretamente

    // 4. Retorna o registro atualizado usando NextResponse.json
    return NextResponse.json(registroAtualizado);

  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    
    // Tratamento de erro específico para registro não encontrado (já estava ótimo)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: `Registro não encontrado.` },
        { status: 404 }
      );
    }

    // Erro genérico do servidor
    return NextResponse.json(
      { error: 'Não foi possível atualizar o status.' },
      { status: 500 }
    );
  }
}