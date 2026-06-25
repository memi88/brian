import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  const prisma = await getDB();
  const pacientes = await prisma.paciente.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    include: {
      _count: {
        select: {
          tarefas: { where: { status: "PENDENTE" } },
          atendimentos: true,
        },
      },
    },
  });
  return NextResponse.json(pacientes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, dataNascimento, responsavel, contato, dataInicioAcomp, observacoes } = body;

  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const prisma = await getDB();
  const paciente = await prisma.paciente.create({
    data: {
      nome: nome.trim(),
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      responsavel: responsavel?.trim() || null,
      contato: contato?.trim() || null,
      dataInicioAcomp: dataInicioAcomp ? new Date(dataInicioAcomp) : null,
      observacoes: observacoes?.trim() || null,
    },
  });

  return NextResponse.json(paciente, { status: 201 });
}
