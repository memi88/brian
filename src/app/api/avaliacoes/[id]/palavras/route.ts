import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { texto, bloco, tipo = "VALIDA", timestamp = 0 } = body;

  if (!texto?.trim() || bloco === undefined) {
    return NextResponse.json({ error: "texto e bloco são obrigatórios" }, { status: 400 });
  }

  const prisma = await getDB();
  const palavra = await prisma.palavra.create({
    data: {
      avaliacaoId: id,
      texto: String(texto).trim().toLowerCase(),
      bloco: Number(bloco),
      tipo: tipo as "VALIDA" | "REPETICAO" | "INTRUSAO" | "NEOLOGISMO",
      timestamp: Number(timestamp),
    },
  });

  return NextResponse.json(palavra, { status: 201 });
}
