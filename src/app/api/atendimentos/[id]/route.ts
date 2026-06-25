import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const atendimento = await prisma.atendimento.findUnique({
    where: { id },
    include: {
      paciente: true,
      tarefas: { orderBy: { createdAt: "asc" } },
      plano: true,
    },
  });

  if (!atendimento) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(atendimento);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const { data, horario, resumo, atividades } = body;

  const atendimento = await prisma.atendimento.update({
    where: { id },
    data: {
      ...(data !== undefined && { data: new Date(data) }),
      ...(horario !== undefined && { horario: horario?.trim() || null }),
      ...(resumo !== undefined && { resumo: resumo?.trim() || null }),
      ...(atividades !== undefined && { atividades: atividades?.trim() || null }),
    },
  });

  return NextResponse.json(atendimento);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  await prisma.atendimento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
