// app/api/registrar_Foco/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // 1. Pega os dados enviados pelo frontend
    const body = await request.json();
    const { tipo, descricao, localizacao, foto, status } = body;

    // 2. Validação simples dos dados
    if (!tipo || !localizacao) {
      return new Response(
        JSON.stringify({ error: 'Campos "tipo" e "localizacao" são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Usa o Prisma para criar o novo registro no banco de dados
    //    CORREÇÃO: Alterado de 'prisma.foco' para 'prisma.registro'
    const novoRegistro = await prisma.registro.create({
      data: {
        tipo,
        descricao,
        localizacao,
        foto,
        status: status || 'suspeito', // Garante um valor padrão
      },
    });

    // 4. Retorna o registro recém-criado com status 201 (Created)
    return new Response(
      JSON.stringify(novoRegistro),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 5. Se ocorrer qualquer outro erro, retorna um erro de servidor
    console.error("Erro ao registrar foco:", error);
    return new Response(
      JSON.stringify({ error: 'Não foi possível registrar o foco.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}