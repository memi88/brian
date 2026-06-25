import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const { plano } = body;

  const updated = await prisma.planoSessao.update({
    where: { id },
    data: { plano: plano.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  await prisma.planoSessao.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
