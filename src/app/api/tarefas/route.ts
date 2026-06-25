import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");
  const status = searchParams.get("status");

  const prisma = await getDB();
  const tarefas = await prisma.tarefa.findMany({
    where: {
      ...(pacienteId && { pacienteId }),
      ...(status && { status: status as "PENDENTE" | "CONCLUIDA" }),
    },
    orderBy: { createdAt: "desc" },
    include: { paciente: { select: { id: true, nome: true } } },
  });

  return NextResponse.json(tarefas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pacienteId, atendimentoId, descricao } = body;

  if (!pacienteId || !descricao?.trim()) {
    return NextResponse.json({ error: "pacienteId e descrição são obrigatórios" }, { status: 400 });
  }

  const prisma = await getDB();
  const tarefa = await prisma.tarefa.create({
    data: {
      pacienteId,
      atendimentoId: atendimentoId || null,
      descricao: descricao.trim(),
    },
  });

  return NextResponse.json(tarefa, { status: 201 });
}
