import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pacienteId, data, horario, resumo, atividades, planoId } = body;

  if (!pacienteId || !data) {
    return NextResponse.json({ error: "pacienteId e data são obrigatórios" }, { status: 400 });
  }

  const prisma = await getDB();

  const atendimento = await prisma.atendimento.create({
    data: {
      pacienteId,
      data: new Date(data),
      horario: horario?.trim() || null,
      resumo: resumo?.trim() || null,
      atividades: atividades?.trim() || null,
    },
  });

  if (planoId) {
    await prisma.planoSessao.update({
      where: { id: planoId },
      data: { atendimentoId: atendimento.id },
    });
  }

  return NextResponse.json(atendimento, { status: 201 });
}
