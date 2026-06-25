import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const { nome, cor, ativo } = body;

  const categoria = await prisma.categoriaSemantica.update({
    where: { id },
    data: {
      ...(nome !== undefined && { nome: nome.trim() }),
      ...(cor !== undefined && { cor: cor.trim() }),
      ...(ativo !== undefined && { ativo }),
    },
  });

  return NextResponse.json(categoria);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  await prisma.categoriaSemantica.update({ where: { id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}
