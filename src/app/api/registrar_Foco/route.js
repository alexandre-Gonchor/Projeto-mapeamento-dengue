// app/api/registrar_Foco/route.js

import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises'; // Para salvar o arquivo de forma assíncrona
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // 1. Em vez de .json(), usamos .formData() para lidar com arquivos
    const formData = await request.formData();

    // 2. Extrai os campos de texto do FormData
    const tipo = formData.get('tipo');
    const descricao = formData.get('descricao');
    const localizacao = formData.get('localizacao');
    const status = formData.get('status') || 'suspeito';

    // 3. Validação dos dados
    if (!tipo || !localizacao) {
      return new Response(JSON.stringify({ error: 'Campos "tipo" e "localizacao" são obrigatórios.' }), { status: 400 });
    }

    // 5. Usa o Prisma para criar o novo registro no banco de dados
    const novoRegistro = await prisma.registro.create({
      data: {
        tipo,
        descricao,
        localizacao,
        status,
      },
    });

    // 6. Retorna o registro recém-criado com status 201 (Created)
    return new Response(JSON.stringify(novoRegistro), { status: 201 });

  } catch (error) {
    // 7. Se ocorrer qualquer outro erro, retorna um erro de servidor
    console.error("Erro ao registrar foco:", error);
    return new Response(JSON.stringify({ error: 'Não foi possível registrar o foco.' }), { status: 500 });
  }
}