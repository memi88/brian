import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      atendimentos: {
        orderBy: { data: "desc" },
        include: { tarefas: true },
      },
      tarefas: {
        orderBy: { createdAt: "desc" },
      },
      planos: {
        where: { atendimentoId: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      avaliacoes: {
        orderBy: { dataAplicacao: "desc" },
        include: { categoria: true },
      },
    },
  });

  if (!paciente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(paciente);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const { nome, dataNascimento, responsavel, contato, dataInicioAcomp, observacoes, ativo } = body;

  const paciente = await prisma.paciente.update({
    where: { id },
    data: {
      ...(nome !== undefined && { nome: nome.trim() }),
      ...(dataNascimento !== undefined && { dataNascimento: dataNascimento ? new Date(dataNascimento) : null }),
      ...(responsavel !== undefined && { responsavel: responsavel?.trim() || null }),
      ...(contato !== undefined && { contato: contato?.trim() || null }),
      ...(dataInicioAcomp !== undefined && { dataInicioAcomp: dataInicioAcomp ? new Date(dataInicioAcomp) : null }),
      ...(observacoes !== undefined && { observacoes: observacoes?.trim() || null }),
      ...(ativo !== undefined && { ativo }),
    },
  });

  return NextResponse.json(paciente);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  await prisma.paciente.update({ where: { id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}
