// app/api/atualizar_status/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Validação dos dados recebidos
    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: 'ID do registro e novo status são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Lista de status permitidos
    const statusPermitidos = ['suspeito', 'confirmado', 'resolvido'];
    if (!statusPermitidos.includes(status)) {
        return new Response(
            JSON.stringify({ error: 'Status inválido.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Atualiza o registro no banco de dados usando o Prisma
    const registroAtualizado = await prisma.registro.update({
      where: {
        id: parseInt(id), // Garante que o ID é um número
      },
      data: {
        status: status,
      },
    });

    return new Response(
      JSON.stringify(registroAtualizado),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    // Trata o caso de o registro não ser encontrado
    if (error.code === 'P2025') {
        return new Response(
            JSON.stringify({ error: `Registro com ID ${id} não encontrado.` }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }
    return new Response(
      JSON.stringify({ error: 'Não foi possível atualizar o status.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}