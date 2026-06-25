import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string; palavraId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { palavraId } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const { texto, bloco, tipo } = body;

  const palavra = await prisma.palavra.update({
    where: { id: palavraId },
    data: {
      ...(texto !== undefined && { texto: String(texto).trim().toLowerCase() }),
      ...(bloco !== undefined && { bloco: Number(bloco) }),
      ...(tipo !== undefined && { tipo }),
    },
  });

  return NextResponse.json(palavra);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { palavraId } = await params;
  const prisma = await getDB();
  await prisma.palavra.delete({ where: { id: palavraId } });
  return NextResponse.json({ ok: true });
}
