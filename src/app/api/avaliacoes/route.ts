import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

const TIPOS_VALIDOS = ["LIVRE", "FONEMICA", "SEMANTICA"] as const;
type TipoAvaliacao = (typeof TIPOS_VALIDOS)[number];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  const prisma = await getDB();
  const avaliacoes = await prisma.avaliacao.findMany({
    where: { ...(pacienteId && { pacienteId }) },
    orderBy: { dataAplicacao: "desc" },
    include: {
      paciente: { select: { id: true, nome: true } },
      categoria: { select: { id: true, nome: true, cor: true } },
    },
  });

  return NextResponse.json(avaliacoes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pacienteId, categoriaId, nomePacienteNovo, tipo } = body;

  if (!tipo || !TIPOS_VALIDOS.includes(tipo as TipoAvaliacao)) {
    return NextResponse.json(
      { error: "tipo é obrigatório: LIVRE, FONEMICA ou SEMANTICA" },
      { status: 400 }
    );
  }

  const prisma = await getDB();

  let pid = pacienteId;

  if (!pid && nomePacienteNovo?.trim()) {
    const novoPaciente = await prisma.paciente.create({
      data: { nome: nomePacienteNovo.trim() },
    });
    pid = novoPaciente.id;
  }

  if (!pid) {
    return NextResponse.json({ error: "Selecione um paciente ou informe o nome" }, { status: 400 });
  }

  const avaliacao = await prisma.avaliacao.create({
    data: {
      pacienteId: pid,
      tipo,
      ...(categoriaId && { categoriaId }),
    },
  });

  return NextResponse.json(avaliacao, { status: 201 });
}
