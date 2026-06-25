import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      paciente: { select: { id: true, nome: true } },
      categoria: { select: { id: true, nome: true, cor: true } },
      palavras: { orderBy: [{ bloco: "asc" }, { timestamp: "asc" }] },
    },
  });

  if (!avaliacao) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(avaliacao);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const {
    duracaoSegundos, totalPalavras, totalValidas, totalRepeticoes,
    totalIntrusoes, totalNeologismos, transcricaoRaw, revisaoCompleta,
  } = body;

  const avaliacao = await prisma.avaliacao.update({
    where: { id },
    data: {
      ...(duracaoSegundos !== undefined && { duracaoSegundos }),
      ...(totalPalavras !== undefined && { totalPalavras }),
      ...(totalValidas !== undefined && { totalValidas }),
      ...(totalRepeticoes !== undefined && { totalRepeticoes }),
      ...(totalIntrusoes !== undefined && { totalIntrusoes }),
      ...(totalNeologismos !== undefined && { totalNeologismos }),
      ...(transcricaoRaw !== undefined && { transcricaoRaw }),
      ...(revisaoCompleta !== undefined && { revisaoCompleta }),
    },
  });

  return NextResponse.json(avaliacao);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  await prisma.$transaction([
    prisma.palavra.deleteMany({ where: { avaliacaoId: id } }),
    prisma.avaliacao.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
