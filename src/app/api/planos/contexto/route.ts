import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  if (!pacienteId) return NextResponse.json({ ultimoAtendimento: null });

  const prisma = await getDB();
  const ultimoAtendimento = await prisma.atendimento.findFirst({
    where: { pacienteId },
    orderBy: { data: "desc" },
    include: {
      tarefas: { where: { status: "PENDENTE" }, orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ ultimoAtendimento });
}
