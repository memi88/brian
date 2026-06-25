import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const { descricao, status } = body;

  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: {
      ...(descricao !== undefined && { descricao: descricao.trim() }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(tarefa);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  await prisma.tarefa.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
