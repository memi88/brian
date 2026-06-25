import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pacienteId, plano } = body;

  if (!pacienteId || !plano?.trim()) {
    return NextResponse.json({ error: "pacienteId e plano são obrigatórios" }, { status: 400 });
  }

  const prisma = await getDB();

  const ultimoAtendimento = await prisma.atendimento.findFirst({
    where: { pacienteId },
    orderBy: { data: "desc" },
    include: {
      tarefas: { where: { status: "PENDENTE" } },
    },
  });

  const novoPlano = await prisma.planoSessao.create({
    data: { pacienteId, plano: plano.trim() },
  });

  return NextResponse.json({ plano: novoPlano, ultimoAtendimento }, { status: 201 });
}
